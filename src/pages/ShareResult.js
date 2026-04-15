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
  RulerIcon,
  ChartPieIcon,
} from '../components/Icons';

const normalizeSection = (name) => (name || '').toLowerCase().trim();

const SectionLogoByName = ({ sectionName, className = 'w-[22px] h-[22px]' }) => {
  const s = normalizeSection(sectionName);
  if (s.includes('verbal'))     return <VerbalAbilityLogoIcon className={className} />;
  if (s.includes('analytical')) return <AnalyticalAbilityLogoIcon className={className} />;
  if (s.includes('clerical'))   return <ClericalAbilityLogoIcon className={className} />;
  if (s.includes('numerical'))  return <NumericalAbilityLogoIcon className={className} />;
  return <GeneralInformationLogoIcon className={className} />;
};

const SemiCircleGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  const outerR   = 160;
  const trackW   = 15;
  const midR     = outerR - trackW / 2;
  const innerPct = ((outerR - trackW) / outerR * 100).toFixed(3);

  const progressDeg = (pct / 100) * 180;
  const pd = progressDeg.toFixed(2);

  const toRad = (d) => (d * Math.PI) / 180;
  const angle   = 180 - (pct / 100) * 180;
  const handleX = outerR + midR * Math.cos(toRad(angle));
  const handleY = outerR - midR * Math.sin(toRad(angle));

  const colorLayer = `conic-gradient(from -90deg,
    #9F0B1D   0deg,
    #C95B2A  40deg,
    #FFA153  80deg,
    #FFC170 100deg,
    #8DC96A 130deg,
    #06A561 180deg,
    white   180deg 360deg)`;

  const maskConic = pct <= 0
    ? `conic-gradient(from -90deg, #E5E7EB 0deg, #E5E7EB 180deg, white 180deg, white 360deg)`
    : `conic-gradient(from -90deg, transparent 0deg, transparent ${pd}deg, #E5E7EB ${pd}deg, #E5E7EB 180deg, white 180deg, white 360deg)`;

  const bg = `${maskConic}, ${colorLayer}`;

  return (
    <div className="relative w-full" style={{ maxWidth: '240px' }}>
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '50%' }}>
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '200%', borderRadius: '50%', background: bg }}
        >
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: `${innerPct}%`,
              aspectRatio: '1',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {pct > 0 && (
          <div
            className="absolute rounded-full"
            style={{
              width: 16,
              height: 16,
              background: '#ffffff',
              border: `3px solid ${pct <= 33.33 ? '#9F0B1D' : pct <= 66.66 ? '#FFA153' : '#06A561'}`,
              left: `${(handleX / (outerR * 2)) * 100}%`,
              top: `${(handleY / outerR) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <span className="font-inter font-medium text-[#232027] text-[38px]">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

const ShareResult = () => {
  const { shareToken } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

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
  const title            = reviewer?.title || 'Exam';
  const breakdown        = result.sectionScores || [];
  const totalCorrect     = result.correct    || 0;
  const totalIncorrect   = result.incorrect  || breakdown.reduce((s, r) => s + (r.incorrect  ?? 0), 0);
  const totalUnanswered  = result.unanswered || breakdown.reduce((s, r) => s + (r.unanswered ?? 0), 0);
  const totalItems       = result.totalItems || 0;
  const pct              = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passed           = result.passed;
  const passingThreshold = reviewer?.examConfig?.passingThreshold || 80;
  const passingScore     = result.passingScore ?? Math.ceil((passingThreshold / 100) * totalItems);

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

  const durationMs  = result.duration != null ? result.duration * 1000 : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH   = Math.floor(durationMin / 60);
  const durationM   = durationMin % 60;
  const duration    = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} min${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const pctNum    = parseFloat(pct);
  const readiness = pctNum >= 85
    ? { label: 'Exam Ready',        message: 'You are above the passing threshold.' }
    : pctNum >= 75
      ? { label: 'Almost Ready',      message: 'A few improvements can push you to passing.' }
      : pctNum >= 60
        ? { label: 'Needs Improvement', message: "You're within reach but need more practice." }
        : { label: 'Early Stage',       message: 'Focus on building fundamentals first.' };

  const sortedSections   = [...breakdown].sort((a, b) => b.score - a.score);
  const lowestSection    = sortedSections[sortedSections.length - 1] || null;
  const gapToPass        = passed ? 0 : Math.max(0, passingScore - totalCorrect);

  const sectionDistribution  = reviewer?.examConfig?.sectionDistribution || [];
  const lowestSectionDist    = lowestSection
    ? sectionDistribution.find((sd) => sd.section?.toLowerCase() === lowestSection.section?.toLowerCase())
    : null;
  const focusSectionWeight   = lowestSection
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

      {/* ── Navbar ── */}
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

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">

        {/* Context label */}
        <p className="font-inter font-normal text-[14px] text-[#45464E] mb-[24px] max-w-[840px] mx-auto">
          Shared Mock Score Card
        </p>

        {/* ── Score Overview Card ── */}
        <section className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto">

          <div className="flex items-start justify-between gap-4 mb-[28px] items-center">
            <h2 className="font-inter font-bold text-[16px] text-[#45464E] leading-snug">{title}</h2>
            {dateStr && (
              <span className="font-inter font-normal text-[13px] text-[#6B7280] shrink-0">{dateStr}</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-[20px] md:gap-[24px] items-center">

            {/* Gauge */}
            <div className="flex flex-col items-center w-full max-w-[320px] shrink-0">
              <SemiCircleGauge percentage={pct} />
              <p className="font-inter font-regular text-[14px] text-[#0F172ABF]">Exam Score</p>
              <p className="font-inter font-regular text-[14px] text-[#45464E80] mt-[4px] text-center max-w-[261px]">
                This score is for this exam attempt only
              </p>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0 max-w-[448px] w-full">
              <div className="divide-y divide-[#181D1F1A]">
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Mock Exam Score</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{pct}%</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Correct Items</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{totalCorrect} / {totalItems}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Status</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{readiness.label}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Total Time</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{duration}</span>
                </div>
              </div>

              <div className="mt-[16px]">
                <p className="font-inter font-medium text-[14px] text-[#45464E]">{readiness.message}</p>
                {sectionWeightsText && (
                  <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[6px] leading-[20px]">
                    Weighted by section coverage:<br />{sectionWeightsText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Exam Breakdown Card ── */}
        <section className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto">
          <h3 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">Detailed Exam Breakdown</h3>
          <p className="font-inter font-regular text-[14px] text-[#0F172ABF] mb-[24px]">Your performance breakdown for this exam attempt.</p>

          <div className="overflow-x-auto mb-[28px]">
            <table className="w-full font-inter text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[#181D1F26]" style={{ background: 'linear-gradient(0deg, #FAFAFB, #FAFAFB),linear-gradient(0deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02))' }}>
                  {['Section', 'Items', 'Correct', 'Incorrect', 'Unanswered', 'Your Score'].map((h) => (
                    <th key={h} className="text-left py-[11px] px-[14px] font-bold text-[#45464E] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-[#181D1F1A] hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{capitalize(row.section)}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.totalItems}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.correct}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.incorrect ?? 0}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.unanswered ?? 0}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.score} %</td>
                  </tr>
                ))}
                <tr className="border-b border-[#181D1F1A]">
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">Total</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalItems}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalCorrect}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalIncorrect}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalUnanswered}</td>
                  <td className={`py-[12px] px-[14px] font-bold ${passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{pct} %</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-[10px] mb-[14px]">
            <Link
              to="/"
              className="font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[20px] rounded-[8px]"
            >
              Try Reviewly Free
            </Link>
          </div>

          <p className="font-inter font-normal text-[14px] text-[#45464E80]">
            Based on their most recent full mock.
          </p>
          {!passed && passingScore > 0 && (
            <p className="font-inter font-normal text-[14px] text-[#45464E80] mt-[4px]">
              Passing target: {passingScore} correct ({passingThreshold}%)
            </p>
          )}
        </section>

        {/* ── Recommended Focus Card ── */}
        {!passed && lowestSection && (
          <section className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto">
            <h3 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">Recommended Focus</h3>
            <p className="font-inter font-regular text-[14px] text-[#0F172ABF] mb-[16px]">
              Improving this section will raise their next mock score the fastest.
            </p>

            <div className="flex flex-col sm:flex-row gap-[16px]">

              {/* Section to focus */}
              <div className="flex items-center gap-[16px] max-w-[248px] w-full">
                <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                  <SectionLogoByName sectionName={lowestSection.section} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-[14px] text-[#0F172A]">{capitalize(lowestSection.section)}</p>
                  <p className="font-inter font-normal text-[14px] text-[#45464E]">Section to focus</p>
                </div>
              </div>

              {/* Items to pass */}
              {gapToPass > 0 && (
                <div className="flex items-center gap-[16px] max-w-[248px] w-full">
                  <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                    <RulerIcon className="w-[24px] h-[24px] rotate-[7.8deg]" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[14px] text-[#0F172A]">{gapToPass} item{gapToPass !== 1 ? 's' : ''}</p>
                    <p className="font-inter font-normal text-[14px] text-[#45464E]">To pass</p>
                  </div>
                </div>
              )}

              {/* Section weight */}
              {focusSectionWeight > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                    <ChartPieIcon className="w-[24px] h-[24px]" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{focusSectionWeight}%</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section weight</p>
                  </div>
                </div>
              )}
            </div>

            <p className="font-inter font-normal text-[14px] text-[#45464E80] mt-[24px]">
              This is what their Sprint Plan will prioritize first.
            </p>
          </section>
        )}

      </main>
    </div>
  );
};

export default ShareResult;
