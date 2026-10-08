import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Award,
  Flame,
  CheckCircle2,
  Users,
  ShieldCheck,
  Star,
  Sparkles,
  Calendar,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { GamificationState } from '../types';
import confetti from 'canvas-confetti';

export const GamificationPage: React.FC = () => {
  const { t, ecoPoints, addPoints, showToast } = useApp();

  const [data, setData] = useState<GamificationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'individual' | 'community'>('individual');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchGamification = async () => {
    try {
      setLoading(true);
      const res = await api.getGamification();
      if (res) setData(res);
    } catch (err) {
      console.error('Gamification error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamification();
  }, []);

  const handleClaimChallenge = async (challengeId: string, rewardPoints: number) => {
    setClaimingId(challengeId);
    try {
      const res = await api.claimChallenge(challengeId);
      if (res.success) {
        // Fire confetti celebration!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });

        addPoints(rewardPoints, 'Weekly Eco Challenge Completed!');
        showToast(`Challenge claimed! +${rewardPoints} points added to your balance.`, 'success');

        // Update local challenge status
        setData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            weeklyChallenges: prev.weeklyChallenges.map(c =>
              c.id === challengeId ? { ...c, completed: true, currentProgress: c.targetProgress } : c
            )
          };
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Could not claim challenge.', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-700" />
          <span>Civic Recognition & Circular Rewards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Eco Points & Community Leaderboard
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Earn verified recognition for diverting waste, composting kitchen scraps, and keeping public neighborhoods spotless.
        </p>
      </div>

      {/* Ethical Gamification Banner (Required) */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Ethical Community Standard:</strong> Points are only rewarded for safe, verified segregation and legitimate waste diversion. Never handle hazardous chemicals, live batteries, or biohazards in an attempt to accumulate points.
        </p>
      </div>

      {/* Profile Points Summary Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Active Citizen Status</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            {data?.userLevel || 'Eco Guardian (Level 3)'}
          </h2>
          <p className="text-xs text-emerald-100/80">
            Keep logging your segregation and cleanups to reach Level 4 (Circular Champion).
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[160px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            Total Balance
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-300 my-1">
            {ecoPoints}
          </div>
          <span className="text-[10px] text-emerald-200 font-medium">Eco Points</span>
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Weekly Eco Challenges</h3>
            <p className="text-xs text-slate-500">Complete challenges by next Sunday to earn bonus points</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Resets Weekly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.weeklyChallenges.map(challenge => {
            const isCompleted = challenge.completed || challenge.currentProgress >= challenge.targetProgress;
            const progressPercent = Math.min(
              100,
              Math.round((challenge.currentProgress / challenge.targetProgress) * 100)
            );

            return (
              <div
                key={challenge.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      +{challenge.rewardPoints} Pts
                    </span>
                    <span className="text-[10px] text-slate-400">Ends {challenge.deadline}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{challenge.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Progress</span>
                    <span>
                      {challenge.currentProgress} / {challenge.targetProgress} {challenge.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => handleClaimChallenge(challenge.id, challenge.rewardPoints)}
                    disabled={challenge.completed || claimingId === challenge.id}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      challenge.completed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : isCompleted
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {challenge.completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{claimingId === challenge.id ? 'Claiming...' : 'Claim Points'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Civic Achievement Badges</h3>
          <p className="text-xs text-slate-500">Unlocked through consistent segregation and community action</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {data?.userBadges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                badge.unlocked
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="text-3xl">{badge.icon}</div>
              <h5 className="text-xs font-bold">{badge.name}</h5>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                {badge.description}
              </p>
              <span
                className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  badge.unlocked
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Civic Leaderboard</h3>
            <p className="text-xs text-slate-500">Updated weekly across Bangalore neighborhoods and universities</p>
          </div>

          {/* Leaderboard Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'individual'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individual Citizens
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'community'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Colleges & Apartment Societies
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Champion / Organization</th>
                <th className="py-3 px-3">Locality / Category</th>
                <th className="py-3 px-3 text-right">Waste Diverted</th>
                <th className="py-3 px-3 text-right">Eco Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {activeTab === 'individual'
                ? data?.individualLeaderboard.map(item => (
                    <tr
                      key={item.rank}
                      className={`hover:bg-slate-50 transition ${
                        item.name.includes('You') ? 'bg-emerald-50/70 font-bold text-emerald-950' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            item.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : item.rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : item.rank === 3
                              ? 'bg-amber-50 text-amber-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <span className="text-base">{item.avatar}</span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{item.locality}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                        {item.divertedKg} kg
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {item.points.toLocaleString()}
                      </td>
                    </tr>
                  ))
                : data?.communityLeaderboard.map(item => (
                    <tr key={item.rank} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            item.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">
                          {item.category} ({item.members} members)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                        {item.divertedKg.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {item.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

