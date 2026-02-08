import React from 'react';

/** Wavy yellow underline for "level up" in the hero headline. Use under the text. */
export const LevelUpUnderline = ({ className = "w-full h-[15px]" }) => (
  <svg className={className} viewBox="0 0 148 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0.297852 6.0167C19.1955 4.40398 87.9829 1.26735 144.298 6.01672C115.066 6.01672 76.9785 6.49696 52.4553 11.5" stroke="#FFC92A" strokeWidth="7" strokeLinejoin="round" />
  </svg>
);

/** Hero decorative icon - 3D cube. */
export const CubeIcon = ({ className = "w-[65px] h-[66px]" }) => (
  <svg className={className} viewBox="0 0 65 66" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M34.3033 0.866771C33.4332 0.290302 32.4101 -0.0115487 31.3664 0.000338038C30.3228 0.0122248 29.3067 0.337301 28.45 0.933438L2.23333 19.2001C0.833333 20.1734 0 21.7668 0 23.4734V43.1501C0 44.9001 0.88 46.5301 2.34 47.4934L28.9867 65.1101C29.8385 65.6733 30.8371 65.9736 31.8583 65.9736C32.8795 65.9736 33.8782 65.6733 34.73 65.1101L61.9067 47.1568C63.3667 46.1901 64.2433 44.5568 64.2433 42.8101V23.4768C64.2433 21.7301 63.3667 20.1001 61.91 19.1334L34.3033 0.866771ZM54.6033 22.1768L44.5567 28.9201L35.1367 22.0701L35.0767 8.59677L54.6 22.1768H54.6033ZM28.2633 8.6101V21.8001L18.6067 28.5468L8.98333 22.0901L28.2633 8.6101V8.6101ZM6.34 28.5868L12.5733 32.7634L6.34 37.1234V28.5901V28.5868ZM28.4233 56.6968L8.98667 43.6668L18.6967 36.8768L28.43 43.4034V56.7034L28.4233 56.6968ZM24.74 32.6534L31.0333 28.2534L38.3667 33.0701L31.8667 37.4368L24.74 32.6534ZM35.2967 56.6968V43.3968L44.5967 37.1634L54.6067 43.7468L35.2967 56.6968V56.6968ZM57.38 37.3468L50.78 33.0134L57.38 28.5834V37.3501V37.3468Z" fill="#F1F5F9" />
  </svg>
);

/** Hero decorative icon - cloud with lightning. */
export const CloudThunderIcon = ({ className = "w-[54px] h-[56px]" }) => (
  <svg className={className} viewBox="0 0 54 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M34.6592 37.3266C33.952 37.3266 33.2737 37.0456 32.7736 36.5455C32.2735 36.0454 31.9925 35.3672 31.9925 34.6599C31.9925 33.9527 32.2735 33.2744 32.7736 32.7743C33.2737 32.2742 33.952 31.9932 34.6592 31.9932C37.0671 31.9921 39.4298 31.339 41.4964 30.1031C43.5629 28.8673 45.2563 27.0948 46.3966 24.974C47.5368 22.8532 48.0815 20.4632 47.9728 18.0577C47.864 15.6523 47.1059 13.3212 45.7789 11.3119C44.4519 9.30264 42.6055 7.69024 40.4359 6.6459C38.2662 5.60155 35.8543 5.16425 33.4561 5.38042C31.0579 5.59659 28.763 6.45816 26.815 7.87366C24.8671 9.28916 23.3388 11.2057 22.3925 13.4199L20.4725 17.9159L15.8272 16.3906C14.7279 16.0306 13.5637 15.9132 12.4147 16.0466C11.2657 16.1801 10.1593 16.561 9.17174 17.1633C8.18421 17.7657 7.33903 18.5749 6.69448 19.5354C6.04992 20.4959 5.62132 21.5848 5.43822 22.7269C5.25512 23.869 5.32187 25.0373 5.63388 26.1511C5.94589 27.265 6.49573 28.2979 7.2455 29.1787C7.99527 30.0596 8.92713 30.7673 9.97684 31.2532C11.0266 31.7391 12.1692 31.9916 13.3259 31.9932H18.6592C19.3664 31.9932 20.0447 32.2742 20.5448 32.7743C21.0449 33.2744 21.3259 33.9527 21.3259 34.6599C21.3259 35.3672 21.0449 36.0454 20.5448 36.5455C20.0447 37.0456 19.3664 37.3266 18.6592 37.3266H13.3259C11.3973 37.3255 9.49187 36.906 7.7411 36.0972C5.99033 35.2883 4.43588 34.1092 3.18498 32.6413C1.93409 31.1734 1.01653 29.4516 0.495598 27.5947C-0.0253301 25.7378 -0.137224 23.79 0.167636 21.8856C0.472496 19.9813 1.18685 18.1657 2.26142 16.5642C3.336 14.9627 4.7452 13.6134 6.39182 12.6093C8.03844 11.6053 9.88328 10.9704 11.7991 10.7485C13.7149 10.5266 15.656 10.7229 17.4885 11.3239C19.1807 7.37093 22.1854 4.12313 25.9951 2.1291C29.8047 0.135071 34.1858 -0.482975 38.3984 0.379355C42.611 1.24169 46.3969 3.53154 49.1166 6.86214C51.8363 10.1927 53.3231 14.36 53.3259 18.6599C53.3259 23.6106 51.3592 28.3586 47.8585 31.8592C44.3578 35.3599 39.6099 37.3266 34.6592 37.3266ZM28.5525 29.4972C29.9365 30.0252 30.6512 31.6332 30.1472 33.0866L26.4992 43.6199C25.9925 45.0732 24.4645 45.8226 23.0805 45.2919C21.6965 44.7639 20.9845 43.1559 21.4885 41.7026L25.1365 31.1692C25.6379 29.7159 27.1685 28.9666 28.5525 29.4972V29.4972ZM32.9045 40.0279C34.2885 40.5559 35.0005 42.1639 34.4965 43.6172L30.8485 54.1506C30.3472 55.6039 28.8165 56.3532 27.4325 55.8226C26.0485 55.2946 25.3339 53.6866 25.8379 52.2332L29.4859 41.6999C29.9925 40.2466 31.5205 39.4972 32.9045 40.0279V40.0279ZM23.9925 39.8572H31.9925C33.4645 39.8572 34.6592 41.1106 34.6592 42.6599C34.6592 44.2066 33.4645 45.4599 31.9925 45.4599H23.9925C22.5205 45.4599 21.3259 44.2066 21.3259 42.6599C21.3259 41.1132 22.5205 39.8599 23.9925 39.8599V39.8572Z" fill="#E2E8F0" />
  </svg>
);

/** Hero decorative icon - code/terminal sample. */
export const CodeSampleIcon = ({ className = "w-[37px] h-[27px]" }) => (
  <svg className={className} viewBox="0 0 37 27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10.5106 13.3386L0.610576 3.43858C0.419556 3.25408 0.267192 3.03339 0.162374 2.78939C0.0575556 2.54538 0.00238315 2.28294 7.55135e-05 2.01738C-0.00223212 1.75182 0.0483713 1.48846 0.148933 1.24267C0.249495 0.996876 0.398001 0.773572 0.585786 0.585786C0.773572 0.398001 0.996876 0.249495 1.24267 0.148933C1.48846 0.0483713 1.75182 -0.00223212 2.01738 7.55135e-05C2.28294 0.00238315 2.54538 0.0575556 2.78939 0.162374C3.03339 0.267192 3.25408 0.419556 3.43858 0.610576L14.7526 11.9246C15.1275 12.2996 15.3381 12.8082 15.3381 13.3386C15.3381 13.8689 15.1275 14.3775 14.7526 14.7526L3.43858 26.0666C3.25408 26.2576 3.03339 26.41 2.78939 26.5148C2.54538 26.6196 2.28294 26.6748 2.01738 26.6771C1.75182 26.6794 1.48846 26.6288 1.24267 26.5282C0.996876 26.4277 0.773572 26.2792 0.585786 26.0914C0.398001 25.9036 0.249495 25.6803 0.148933 25.4345C0.0483713 25.1887 -0.00223212 24.9253 7.55135e-05 24.6598C0.00238315 24.3942 0.0575556 24.1318 0.162374 23.8878C0.267192 23.6438 0.419556 23.4231 0.610576 23.2386L10.5106 13.3386V13.3386ZM18.0246 22.0246H34.0246C34.555 22.0246 35.0637 22.2353 35.4388 22.6104C35.8139 22.9854 36.0246 23.4941 36.0246 24.0246C36.0246 24.555 35.8139 25.0637 35.4388 25.4388C35.0637 25.8139 34.555 26.0246 34.0246 26.0246H18.0246C17.4941 26.0246 16.9854 25.8139 16.6104 25.4388C16.2353 25.0637 16.0246 24.555 16.0246 24.0246C16.0246 23.4941 16.2353 22.9854 16.6104 22.6104C16.9854 22.2353 17.4941 22.0246 18.0246 22.0246V22.0246Z" fill="#CBD5E1" />
  </svg>
);

/** Why Reviewly section - purple plane icon (64×64). */
export const WhyReviewlyPlaneIcon = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clipPath="url(#clip0_why_reviewly_plane)">
      <path d="M39.0374 27.3531L51.9164 23.9022C53.2827 23.5361 54.7385 23.7278 55.9635 24.435C57.1884 25.1423 58.0823 26.3072 58.4484 27.6735C58.8145 29.0397 58.6228 30.4955 57.9156 31.7205C57.2084 32.9455 56.0435 33.8393 54.6772 34.2054L16.0401 44.5582L4.17162 31.1739L11.899 29.1034L18.431 32.8746L26.1584 30.8041L16.1755 14.1538L23.9029 12.0833L39.0374 27.3531Z" stroke="#7D52CC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 56H56" stroke="#7D52CC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_why_reviewly_plane">
        <rect width="64" height="64" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const CompassIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 48 51" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 43.8682C34.2173 43.8682 42.5 34.5442 42.5 23.0425C42.5 11.5408 34.2173 2.2168 24 2.2168C13.7827 2.2168 5.5 11.5408 5.5 23.0425C5.5 34.5442 13.7827 43.8682 24 43.8682Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.96 27.861L20.98 20.3863C21.12 20.0486 21.34 19.8009 21.64 19.6433L28.28 16.2437C29.4 15.6808 30.54 16.9641 30.04 18.2249L27.02 25.6997C26.88 26.0374 26.66 26.285 26.36 26.4426L19.72 29.8423C18.6 30.4277 17.44 29.1218 17.96 27.861Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ToothIcon = ({ className = "w-8 h-9" }) => (
  <svg className={className} viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.6266 7.08383C25.2932 5.08756 23.9066 4.15697 22.2532 4.15697C21.1866 4.15697 20.1466 4.54722 19.1466 4.92246H19.1066C18.0399 5.32771 17.0266 5.68794 15.9333 5.68794C14.8533 5.68794 13.7733 5.28269 12.7199 4.90745C11.6933 4.5172 10.6399 4.12695 9.58658 4.12695C7.91992 4.12695 6.5599 5.08757 5.3199 7.11385C3.3599 10.3109 4.46658 13.733 5.37324 16.5098C5.77324 17.7256 6.14656 18.8963 6.14656 19.7669C6.14656 24.2697 6.99989 31.8946 10.1466 31.8946C12.3066 31.8946 12.9866 29.0728 13.5732 26.5512C14.1866 23.9095 14.7333 22.0633 16.0133 22.0633C17.1199 22.0633 17.5332 23.2641 18.1199 26.1609C18.6266 28.6975 19.2532 31.8345 21.9199 31.8345C25.6399 31.8345 25.9199 22.5887 25.9199 19.7519C25.9199 18.9113 26.2799 17.7556 26.6666 16.5398L26.6932 16.4948C27.5466 13.688 28.6666 10.1908 26.6266 7.08383Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlaneIcon = ({ className = "w-8 h-9" }) => (
  <svg className={className} viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.6397 4.90925C26.693 3.84357 25.1597 3.85858 24.2397 4.95428L19.1864 10.883L6.85302 6.29012L4.26636 9.20198L14.5464 16.3315L9.34635 22.4254L6.01302 21.81L3.67969 24.4366L8.58635 26.3729L10.3064 31.8964L12.6397 29.2697L12.093 25.5173L17.5064 19.6636L23.8397 31.236L26.4264 28.3241L22.3464 14.4403L27.613 8.75169C28.5597 7.70102 28.573 5.97493 27.6397 4.90925Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PauseWindowIcon = ({ className = "w-11 h-11" }) => (
  <svg className={className} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.8669 39.1998H7.46675C5.40488 39.1998 3.7334 37.5284 3.7334 35.4664V9.33296C3.7334 7.27109 5.40488 5.59961 7.46675 5.59961H37.3336C39.3955 5.59961 41.0669 7.27109 41.0669 9.33296V26.133" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M35.4668 31.7344V41.0678" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M41.0664 31.7344V41.0678" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.7334 13.0664H41.0669" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33301 9.35277L9.35167 9.33203Z" fill="#6E43B9" />
    <path d="M9.33301 9.35277L9.35167 9.33203" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.9336 9.35277L14.9523 9.33203" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.5332 9.35277L20.5519 9.33203" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BankIcon = ({ className = "w-8 h-9" }) => (
  <svg className={className} viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.2932 25.7266H5.71983C5.07983 25.7266 4.53316 26.2069 4.3865 26.8823L3.71983 30.0493C3.51983 30.9949 4.17316 31.8955 5.05316 31.8955H26.9732C27.8532 31.8955 28.5065 30.9949 28.3065 30.0493L27.6399 26.8823C27.4799 26.2069 26.9332 25.7266 26.2932 25.7266Z" stroke="#6E43B9" strokeWidth="1.5214" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9331 14.7676H7.45312V25.7245H12.9331V14.7676Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23.8794 14.7676H18.3994V25.7245H23.8794V14.7676Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.3337 11.9322C28.3337 13.4932 27.2137 14.769 25.8403 14.769H6.16032C4.78699 14.769 3.66699 13.5082 3.66699 11.9322C3.66699 10.8065 4.24033 9.80086 5.14699 9.35058L14.987 4.38242C15.627 4.05221 16.3603 4.05221 17.0137 4.38242L26.8537 9.35058C27.7603 9.80086 28.3337 10.8065 28.3337 11.9322Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.3203 10.0859H16.6803" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BackpackIcon = ({ className = "w-12 h-14" }) => (
  <svg className={className} viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24.0002 6.19141C17.1802 6.19141 11.6602 12.4053 11.6602 20.0827V43.385C11.6602 45.8616 13.4402 47.8654 15.6402 47.8654H32.3602C34.5602 47.8654 36.3402 45.8616 36.3402 43.385V20.0827C36.3402 12.4053 30.8202 6.19141 24.0002 6.19141Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.5798 31.6562H19.4398C18.5598 31.6562 17.8398 32.4668 17.8398 33.4574V39.131C17.8398 40.1216 18.5598 40.9321 19.4398 40.9321H28.5798C29.4598 40.9321 30.1798 40.1216 30.1798 39.131V33.4574C30.1598 32.4443 29.4598 31.6562 28.5798 31.6562Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.32001 40.9063H11.68V29.334H8.32001C6.76001 29.334 5.5 30.7524 5.5 32.5085V37.7318C5.5 39.4879 6.76001 40.9063 8.32001 40.9063Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M39.6803 40.9063H36.3203V29.334H39.6803C41.2403 29.334 42.5003 30.7524 42.5003 32.5085V37.7318C42.5003 39.4879 41.2403 40.9063 39.6803 40.9063Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.8594 17.4707H29.1394" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.1191 17.4707V19.7897" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HeartBeatIcon = ({ className = "w-12 h-14" }) => (
  <svg className={className} viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 24.7442H11.66L16.82 18.9355L21.94 31.6561L26.06 24.6992H42.5" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 19.632C5.5 16.9978 6.38 14.3636 8.16 12.3599C11.72 8.37484 17.48 8.37484 21.04 12.3599L24 15.692L26.96 12.3599C30.52 8.37484 36.26 8.37484 39.82 12.3599C41.6 14.3636 42.48 16.9753 42.48 19.632" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.7793 29.7852L23.9993 44.6671L37.2193 29.7852" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CardWalletIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 40H10C7.79086 40 6 38.2092 6 36V18C6 15.7909 7.79086 14 10 14H38C40.2092 14 42 15.7909 42 18V36C42 38.2092 40.2092 40 38 40Z" stroke="#6E43B9" strokeWidth="1.5" />
    <path d="M14 14V7.2C14 6.53726 14.5373 6 15.2 6H32.8C33.4628 6 34 6.53726 34 7.2V14" stroke="#6E43B9" strokeWidth="1.5" />
    <path d="M20 6V14" stroke="#6E43B9" strokeWidth="1.5" />
    <path d="M24 6V14" stroke="#6E43B9" strokeWidth="1.5" />
    <path d="M33 28C32.4478 28 32 27.5522 32 27C32 26.4478 32.4478 26 33 26C33.5522 26 34 26.4478 34 27C34 27.5522 33.5522 28 33 28Z" fill="#6E43B9" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ----- Pricing card icons ----- */

export const TriangleFreePlanIcon = ({ className = "w-7 h-6" }) => (
  <svg className={className} viewBox="0 0 29 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29 24H0L14.5 0L29 24Z" fill="#431C86" />
  </svg>
);

export const CirclePremiumWeeklyIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7778 0C10.8585 -4.67373e-08 7.09968 1.55694 4.32831 4.32831C1.55694 7.09968 3.42637e-07 10.8585 0 14.7778C-3.42637e-07 18.6971 1.55694 22.4559 4.32831 25.2272C7.09968 27.9986 10.8585 29.5556 14.7778 29.5556L14.7778 14.7778V0Z" fill="#431C86" />
    <path d="M14.7779 29.5566C18.6972 29.5566 22.456 27.9997 25.2274 25.2283C27.9987 22.457 29.5557 18.6982 29.5557 14.7789C29.5557 10.8596 27.9987 7.10077 25.2274 4.3294C22.456 1.55803 18.6972 0.00108624 14.7779 0.0010859L14.7779 14.7789L14.7779 29.5566Z" fill="#FFC92A" />
    <path d="M14.7779 29.5566C18.6972 29.5566 22.456 27.9997 25.2274 25.2283C27.9987 22.457 29.5557 18.6982 29.5557 14.7789C29.5557 10.8596 27.9987 7.10077 25.2274 4.3294C22.456 1.55803 18.6972 0.00108624 14.7779 0.0010859L14.7779 14.7789L14.7779 29.5566Z" fill="white" fillOpacity="0.5" />
  </svg>
);

export const RectanglePremiumMonthlyIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="14.3784" height="29.5556" fill="#431C86" />
    <rect x="14.3779" width="15.1772" height="29.5556" fill="#FFC92A" />
    <rect x="14.3779" width="15.1772" height="29.5556" fill="white" fillOpacity="0.5" />
    <rect x="14.3779" y="14.377" width="15.1772" height="15.1772" fill="#A18DC3" />
    <rect x="14.3779" y="14.377" width="15.1772" height="15.1772" fill="white" fillOpacity="0.25" />
  </svg>
);

export const HexagonPremiumQuarterlyIcon = ({ className = "w-8 h-9" }) => (
  <svg className={className} viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M33.1082 26.1699L33.1154 26.1659H33.1014L24.8365 21.6875L16.5579 17.2012L8.27894 21.6875L0.0140642 26.1659H0L0.00719566 26.1699L0 26.1738H0.0140642L8.27894 30.6522L16.5579 35.1385L24.8365 30.6522L33.1014 26.1738H33.1154L33.1082 26.1699Z" fill="#A18DC3" />
    <path d="M33.1082 26.1699L33.1154 26.1659H33.1014L24.8365 21.6875L16.5579 17.2012L8.27894 21.6875L0.0140642 26.1659H0L0.00719566 26.1699L0 26.1738H0.0140642L8.27894 30.6522L16.5579 35.1385L24.8365 30.6522L33.1014 26.1738H33.1154L33.1082 26.1699Z" fill="white" fillOpacity="0.25" />
    <path d="M33.1082 8.96868L33.1154 8.96507H33.1014L24.8365 4.48631L16.5579 0L8.27894 4.48631L0.0140642 8.96507H0L0.00719566 8.96868L0 8.97261H0.0140642L8.27894 13.4514L16.5579 17.9377L24.8365 13.4514L33.1014 8.97261H33.1154L33.1082 8.96868Z" fill="#431C86" />
    <path d="M0.0136719 8.60352V26.5333L16.5575 17.5686L0.0136719 8.60352Z" fill="#FFC92A" />
    <path d="M0.0136719 8.60352V26.5333L16.5575 17.5686L0.0136719 8.60352Z" fill="white" fillOpacity="0.5" />
    <path d="M33.1021 8.60352V26.5333L16.5586 17.5686L33.1021 8.60352Z" fill="#FFC92A" />
    <path d="M33.1021 8.60352V26.5333L16.5586 17.5686L33.1021 8.60352Z" fill="white" fillOpacity="0.8" />
  </svg>
);

export const CheckmarkIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="white" />
  </svg>
);

/* ----- How It Works section icons ----- */

export const SendIcon = ({ className = "w-[23px] h-[23px]" }) => (
  <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.8936 11.9944L21.968 0.919922" stroke="#FFC92A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.8931 11.9945C10.8931 11.9945 -3.07966 9.104 1.77595 6.30102C5.87346 3.93584 19.9947 -0.130638 21.9676 0.920062C23.0183 2.8929 18.9518 17.0142 16.5866 21.1117C13.7836 25.9673 10.8931 11.9945 10.8931 11.9945Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DocumentIcon = ({ className = "w-[22px] h-6" }) => (
  <svg className={className} viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7339 15.8529H6.31055" stroke="#FFC92A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.7339 11.4661H6.31055" stroke="#FFC92A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.52471 7.08138H6.31055" stroke="#FFC92A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M0.75 11.5417C0.75 19.6348 3.19767 22.3333 10.5395 22.3333C17.8825 22.3333 20.329 19.6348 20.329 11.5417C20.329 3.4485 17.8825 0.75 10.5395 0.75C3.19767 0.75 0.75 3.4485 0.75 11.5417Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TwoToneStarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C9.96385 3 9.77134 6.54652 8.55911 7.79957C7.34689 9.05263 3.5782 7.61992 3.05459 9.84403C2.53207 12.0693 5.92235 12.8243 6.34036 14.7334C6.76057 16.6426 4.68922 19.3249 6.45916 20.6598C8.22911 21.9936 10.1343 18.9747 12 18.9747" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path opacity="0.4" d="M12 3C14.0361 3 14.2298 6.54652 15.442 7.79957C16.6531 9.05263 20.4229 7.61992 20.9454 9.84403C21.4679 12.0693 18.0787 12.8243 17.6596 14.7334C17.2405 16.6426 19.3108 19.3249 17.5408 20.6598C15.7709 21.9936 13.8656 18.9747 12 18.9747" stroke="#FFC92A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Contact form – category dropdown chevron. */
export const MultiArrowDropdownIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 9.5L12 14.5L17 9.5H7Z" fill="#6C737F" />
  </svg>
);

/* ----- Dashboard nav icons ----- */

/** All Reviewers tab – active: purple + yellow; inactive: grey. */
export const DashAllReviewersIcon = ({ className = "w-5 h-5", active = true }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6.08789 12.1449H14.0821" stroke={active ? '#FFC92A' : '#AEAEAE'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M2.08301 6.49929C2.08301 4.46437 3.12467 2.71675 5.10134 2.31119C7.07717 1.90484 8.57884 2.04532 9.82634 2.71834C11.0747 3.39135 10.7172 4.385 11.9997 5.11437C13.283 5.84453 15.3472 4.7477 16.6955 6.20246C18.1072 7.72548 18.0997 10.0636 18.0997 11.5541C18.0997 17.2175 14.9272 17.6667 10.0913 17.6667C5.25551 17.6667 2.08301 17.2747 2.08301 11.5541V6.49929Z" stroke={active ? '#6E43B9' : '#AEAEAE'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** My Library tab. */
export const DashMyLibraryIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path opacity="0.4" d="M7.11914 7.68229H12.8316" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M9.9752 2.08398C4.6527 2.08398 3.75354 2.86065 3.75354 9.10815C3.75354 16.1023 3.6227 17.9173 4.9527 17.9173C6.28187 17.9173 8.4527 14.8473 9.9752 14.8473C11.4977 14.8473 13.6685 17.9173 14.9977 17.9173C16.3277 17.9173 16.1969 16.1023 16.1969 9.10815C16.1969 2.86065 15.2977 2.08398 9.9752 2.08398Z" stroke="#AEAEAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Account Settings tab. */
export const DashSettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M10.0003 7.91602C11.1511 7.91602 12.0837 8.84862 12.0837 9.99935C12.0837 11.1501 11.1511 12.0827 10.0003 12.0827C8.84959 12.0827 7.91699 11.1501 7.91699 9.99935C7.91699 8.84862 8.84959 7.91602 10.0003 7.91602Z" stroke="#AEAEAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.807 6.04252V6.04252C16.2374 5.04898 14.9764 4.70902 13.9908 5.28275C13.1335 5.78076 12.062 5.15763 12.062 4.1608C12.062 3.01415 11.1386 2.08398 10.0001 2.08398V2.08398C8.8617 2.08398 7.93821 3.01415 7.93821 4.1608C7.93821 5.15763 6.8668 5.78076 6.01032 5.28275C5.0239 4.70902 3.76289 5.04898 3.19326 6.04252C2.62446 7.03607 2.96198 8.30619 3.9484 8.87911C4.80488 9.37794 4.80488 10.6234 3.9484 11.1222C2.96198 11.6959 2.62446 12.9661 3.19326 13.9588C3.76289 14.9523 5.0239 15.2923 6.0095 14.7194H6.01032C6.8668 14.2205 7.93821 14.8437 7.93821 15.8405V15.8405C7.93821 16.9872 8.8617 17.9173 10.0001 17.9173V17.9173C11.1386 17.9173 12.062 16.9872 12.062 15.8405V15.8405C12.062 14.8437 13.1335 14.2205 13.9908 14.7194C14.9764 15.2923 16.2374 14.9523 16.807 13.9588C17.3766 12.9661 17.0383 11.6959 16.0527 11.1222H16.0519C15.1954 10.6234 15.1954 9.37794 16.0527 8.87911C17.0383 8.30619 17.3766 7.03607 16.807 6.04252Z" stroke="#AEAEAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Help Center tab. */
export const DashHelpCenterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path opacity="0.4" d="M13.283 10.3444H13.2905" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path opacity="0.4" d="M9.94221 10.3444H9.94971" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path opacity="0.4" d="M6.60139 10.3444H6.60889" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M15.8929 15.8909C13.3469 18.438 9.57499 18.9883 6.48891 17.561C6.03333 17.3776 3.0846 18.1942 2.44478 17.5552C1.80495 16.9152 2.62232 13.9661 2.43891 13.5105C1.01103 10.4248 1.56208 6.65152 4.10883 4.10526C7.35988 0.852932 12.6418 0.852932 15.8929 4.10526C19.1506 7.36262 19.1439 12.6394 15.8929 15.8909Z" stroke="#AEAEAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Dashboard card – bookmark filled (in library), purple. */
export const BookmarkFilledIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.44444 0H12.3C15.3111 0 17.7444 1.18889 17.7778 4.21111V21.0778C17.7778 21.2667 17.7333 21.4556 17.6444 21.6222C17.5 21.8889 17.2556 22.0889 16.9556 22.1778C16.6667 22.2667 16.3444 22.2222 16.0778 22.0667L8.87778 18.4667L1.66667 22.0667C1.50111 22.1544 1.31111 22.2111 1.12222 22.2111C0.5 22.2111 0 21.7 0 21.0778V4.21111C0 1.18889 2.44444 0 5.44444 0ZM4.68889 8.46667H13.0556C13.5333 8.46667 13.9222 8.07667 13.9222 7.58889C13.9222 7.1 13.5333 6.71111 13.0556 6.71111H4.68889C4.21111 6.71111 3.82222 7.1 3.82222 7.58889C3.82222 8.07667 4.21111 8.46667 4.68889 8.46667Z" fill="#6E43B9" />
  </svg>
);

/** Dashboard card – bookmark outline (add to library), grey. */
export const BookmarkOutlineIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.44444 0H12.3C15.3111 0 17.7444 1.18889 17.7778 4.21111V21.0778C17.7778 21.2667 17.7333 21.4556 17.6444 21.6222C17.5 21.8889 17.2556 22.0889 16.9556 22.1778C16.6667 22.2667 16.3444 22.2222 16.0778 22.0667L8.87778 18.4667L1.66667 22.0667C1.50111 22.1544 1.31111 22.2111 1.12222 22.2111C0.5 22.2111 0 21.7 0 21.0778V4.21111C0 1.18889 2.44444 0 5.44444 0ZM4.68889 8.46667H13.0556C13.5333 8.46667 13.9222 8.07667 13.9222 7.58889C13.9222 7.1 13.5333 6.71111 13.0556 6.71111H4.68889C4.21111 6.71111 3.82222 7.1 3.82222 7.58889C3.82222 8.07667 4.21111 8.46667 4.68889 8.46667Z" fill="#D5D5D5" />
  </svg>
);

/** Search input – magnifying glass (design spec: 18×18, stroke #130F26). */
export const SearchIcon = ({ className = "w-[18px] h-[18px]" }) => (
  <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8.24047" cy="8.24047" r="7.49047" stroke="#130F26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.4502 13.8398L16.3869 16.7689" stroke="#130F26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Upgrade to Premium button – lock icon (18×21, stroke #421A83). */
export const LockIcon = ({ className = "w-[18px] h-[21px]" }) => (
  <svg className={className} viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13.2206 7.65335V5.50435C13.1896 2.98535 11.1216 0.969353 8.60361 1.00035C6.13661 1.03135 4.14161 3.01735 4.09961 5.48435V7.65335" stroke="#421A83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.66016 12.4062V14.6272" stroke="#421A83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M8.66 7.07422C2.915 7.07422 1 8.64222 1 13.3452C1 18.0492 2.915 19.6172 8.66 19.6172C14.405 19.6172 16.321 18.0492 16.321 13.3452C16.321 8.64222 14.405 7.07422 8.66 7.07422Z" stroke="#421A83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Exam Details – Important Notes section header (lightning). */
export const ExamNotesLightningIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.8333 1.66602L2.5 11.666H10L9.16667 18.3327L17.5 8.33268H10L10.8333 1.66602Z" stroke="#6E43B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

/** Exam page – Time Left info icon (i). */
export const ExamTimeInfoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 2 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0.875 3.17285C1.357 3.17285 1.75 3.56585 1.75 4.04785V8.46777C1.75 8.94977 1.357 9.34277 0.875 9.34277C0.393 9.34277 0 8.94977 0 8.46777V4.04785C0 3.56585 0.393 3.17285 0.875 3.17285ZM0.884766 0C1.36777 0 1.75977 0.393 1.75977 0.875C1.75977 1.357 1.368 1.75 0.875 1.75C0.396 1.75 0.00488281 1.357 0.00488281 0.875C0.00488281 0.393078 0.399873 0.000126584 0.884766 0Z" fill="#130F26" />
  </svg>
);

/** Modal close (X) icon. */
export const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 6L6 18" stroke="#45464E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke="#45464E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);