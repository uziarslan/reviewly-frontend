import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sharedAPI } from '../services/api';
import logo from '../Assets/logo.png';
import {
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
} from '../components/Icons';

const normalizeSection = (name) => (name || '').toLowerCase().trim();

const SectionLogo = ({ sectionName, className = 'w-[22px] h-[22px]' }) => {
  const s = normalizeSection(sectionName);
  if (s.includes('verbal')) return <VerbalAbilityLogoIcon className={className} />;
  if (s.includes('analytical')) return <AnalyticalAbilityLogoIcon className={className} />;
  if (s.includes('clerical')) return <ClericalAbilityLogoIcon className={className} />;
  if (s.includes('numerical')) return <NumericalAbilityLogoIcon className={className} />;
  return <GeneralInformationLogoIcon className={className} />;
};

const SemiCircleGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const W = 220;
  const cx = W / 2;
  const cy = 100;
  const r = 88;
  const sw = 13;
  const toRad = (d) => (d * Math.PI) / 180;
  const startX = cx - r;
  const endX = cx + r;
  const angle = 180 - (pct / 100) * 180;
  const px = cx + r * Math.cos(toRad(angle));
  const py = cy - r * Math.sin(toRad(angle));
  const H = cy + sw / 2 + 4;
  const dotColor = pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FBBF24' : '#F87171';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="shareGaugeGrad" x1={startX} y1="0" x2={endX} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
      <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${endX} ${cy}`} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${px} ${py}`} fill="none" stroke="url(#shareGaugeGrad)" strokeWidth={sw} strokeLinecap="round" />
      )}
      {pct > 0 && <circle cx={px} cy={py} r={sw * 0.58} fill={dotColor} />}
    </svg>
  );
};

const ShareResult = () => {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shareToken) { setLoading(false); setError('Invalid link'); return; }
    (async () => {
      try {
        const res = await sharedAPI.getResult(shareToken);
        if (res.success) setData(res.data);
        else setError(res.message || 'Result not found');
      } catch {
        setError('Failed to load shared result');
      } finally {
        setLoading(false);
      }
    })();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F5F4FF] flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-inter text-[16px] text-[#45464E]">{error || 'Result not found'}</p>
        <Link to="/" className="font-inter text-[14px] text-[#6E43B9] hover:underline">Go to Reviewly</Link>
      </div>
    );
  }

  const { reviewer, submittedAt, result } = data;
  const title = reviewer?.title || 'Exam';
  const breakdown = result.sectionScores || [];
  const totalCorrect = result.correct || 0;
  const totalItems = result.totalItems || 0;
  const pct = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passed = result.passed;
  const passingThreshold = reviewer?.examConfig?.passingThreshold || 80;
  const passingScore = result.passingScore ?? Math.ceil((passingThreshold / 100) * totalItems);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const durationMs = (result.duration != null) ? result.duration * 1000 : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} min${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const pctNum = parseFloat(pct);
  const readiness = pctNum >= 85
    ? { label: 'Exam Ready', textColor: 'text-[#16A34A]' }
    : pctNum >= 75
      ? { label: 'Almost Ready', textColor: 'text-[#D97706]' }
      : pctNum >= 60
        ? { label: 'Needs Improvement', textColor: 'text-[#2563EB]' }
        : { label: 'Early Stage', textColor: 'text-[#6E43B9]' };

  const sortedSections = [...breakdown].sort((a, b) => b.score - a.score);
  const lowestSection = sortedSections[sortedSections.length - 1] || null;
  const gapToPass = passed ? 0 : Math.max(0, passingScore - totalCorrect);

  const sectionDistribution = reviewer?.examConfig?.sectionDistribution || [];
  const lowestSectionDist = lowestSection
    ? sectionDistribution.find((sd) => sd.section?.toLowerCase() === lowestSection.section?.toLowerCase())
    : null;
  const focusSectionWeight = lowestSection
    ? Math.round(((lowestSectionDist?.count ?? lowestSection.totalItems) / totalItems) * 100)
    : 0;

  const shortSectionName = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('general')) return 'Gen Info';
    return capitalize(lower);
  };
  const sectionWeightsText = sectionDistribution.length > 0
    ? sectionDistribution.map((sd) => `${shortSectionName(sd.section)} ${Math.round((sd.count / totalItems) * 100)}%`).join(', ')
    : null;

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      {/* Nav */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 h-[60px] flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Reviewly" className="h-[28px]" />
          </Link>
          <Link
            to="/"
            className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[9px] px-[20px] rounded-[8px]"
          >
            Try Reviewly Free
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
        <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mb-[8px] text-center">
          Shared Mock Score Card
        </p>

        {/* Score overview */}
        <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]">
          <div className="flex items-start justify-between gap-4 mb-[20px]">
            <h2 className="font-inter font-semibold text-[17px] text-[#1A1A2E]">{title}</h2>
            <span className="font-inter font-normal text-[13px] text-[#6B7280] shrink-0">{dateStr}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-[32px] md:gap-[48px]">
            <div className="flex flex-col items-center md:w-[240px] shrink-0">
              <SemiCircleGauge percentage={pct} />
              <p className="font-inter font-bold text-[32px] text-[#1A1A2E] leading-none -mt-[6px]">{pct}%</p>
              <p className="font-inter font-normal text-[13px] text-[#6B7280] mt-[6px]">Mock Exam Score</p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="divide-y divide-[#F3F4F6]">
                {[
                  ['Mock Exam Score', `${pct}%`, null],
                  ['Correct Items', `${totalCorrect} / ${totalItems}`, null],
                  ['Status', readiness.label, readiness.textColor],
                  ['Total Time', duration, null],
                ].map(([label, value, color], i) => (
                  <div key={i} className="flex items-center justify-between py-[13px]">
                    <span className="font-inter font-normal text-[14px] text-[#6B7280]">{label}</span>
                    <span className={`font-inter font-semibold text-[14px] ${color || 'text-[#1A1A2E]'}`}>{value}</span>
                  </div>
                ))}
              </div>
              {sectionWeightsText && (
                <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[12px] leading-[20px]">
                  Weighted by section coverage:<br />{sectionWeightsText}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Breakdown */}
        <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]">
          <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Detailed Exam Breakdown</h3>
          <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[20px]">Section-level performance for this mock attempt.</p>

          <div className="overflow-x-auto">
            <table className="w-full font-inter text-[14px] border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Section', 'Score', 'Your Score'].map((h) => (
                    <th key={h} className="text-left py-[11px] px-[14px] font-medium text-[#6B7280] text-[13px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6]">
                    <td className="py-[12px] px-[14px] text-[#45464E]">{capitalize(row.section)}</td>
                    <td className="py-[12px] px-[14px] text-[#45464E]">{row.correct}/{row.totalItems}</td>
                    <td className="py-[12px] px-[14px] font-semibold text-[#45464E]">{row.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[10px]">Based on their most recent full mock.</p>
        </section>

        {/* Recommended Focus */}
        {!passed && lowestSection && (
          <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]">
            <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Recommended Focus</h3>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">
              Improving this section will raise their next mock score the fastest.
            </p>
            <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[32px]">
              <div className="flex items-center gap-[14px]">
                <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                  <SectionLogo sectionName={lowestSection.section} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{capitalize(lowestSection.section)}</p>
                  <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section to focus</p>
                </div>
              </div>
              {gapToPass > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#FFF9EC] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{gapToPass} item{gapToPass !== 1 ? 's' : ''}</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">To pass</p>
                  </div>
                </div>
              )}
              {focusSectionWeight > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F0FDF4] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="1.5" />
                      <path d="M12 2a10 10 0 0 1 10 10H12V2Z" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{focusSectionWeight}%</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section weight</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center mt-[24px]">
          <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[12px]">
            Get your own Mock Score Check
          </p>
          <Link
            to="/"
            className="inline-block font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[24px] rounded-[8px]"
          >
            Try Reviewly Free
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ShareResult;
