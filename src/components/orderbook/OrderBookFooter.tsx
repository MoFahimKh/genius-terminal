// 'use client';

// import { useMemo, useRef, useState } from 'react';
// import { ChevronDown } from 'lucide-react';

// import { useOnClickOutside } from '@/hooks/useOnClickOutside';

// export type LayoutSetting = 'onlySell' | 'onlyBuy' | 'both';

// type Props = {
//   setTabLayoutSetting: (val: LayoutSetting) => void;
//   grouping: number;
//   setGrouping: (val: number) => void;
//   baseToken: string;
//   quoteToken: string;
//   currentDenom: 'base' | 'quote';
//   setDenom: (val: 'base' | 'quote') => void;
// };

// export const OrderBookFooter = ({
//   setTabLayoutSetting,
//   grouping,
//   setGrouping,
//   baseToken,
//   quoteToken,
//   currentDenom,
//   setDenom,
// }: Props) => {
//   const [tokenModal, setTokenModal] = useState(false);
//   const tokenRef = useRef<HTMLDivElement>(null);
//   useOnClickOutside(tokenRef, () => setTokenModal(false));

//   const [groupingModal, setGroupingModal] = useState(false);
//   const groupingRef = useRef<HTMLDivElement>(null);
//   useOnClickOutside(groupingRef, () => setGroupingModal(false));

//   const groupingOptions = useMemo(() => [0.0001, 0.001, 0.01, 0.1, 1], []);
//   const displayToken = currentDenom === 'base' ? baseToken : quoteToken;

//   return (
//     <div className="bg-default flex items-center justify-between px-2 py-2">
//       <div className="flex gap-2">
//         <button onClick={() => setTabLayoutSetting('both')}>
//           <img src="/assets/icons/terminal/frame1.svg" alt="show both" className="h-4 w-4" />
//         </button>
//         <button onClick={() => setTabLayoutSetting('onlySell')}>
//           <img src="/assets/icons/terminal/frame2.svg" alt="sell only" className="h-4 w-4" />
//         </button>
//         <button onClick={() => setTabLayoutSetting('onlyBuy')}>
//           <img src="/assets/icons/terminal/frame3.svg" alt="buy only" className="h-4 w-4" />
//         </button>
//       </div>

//       <div className="flex gap-2">
//         <button
//           onClick={() => setTokenModal((prev) => !prev)}
//           className="rounded-default relative flex items-center gap-1 bg-[#2B2B2B] px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
//           {displayToken}
//           <ChevronDown size={12} />
//           {tokenModal && (
//             <div
//               ref={tokenRef}
//               className="main-bg rounded-default border-default absolute right-0 bottom-6 z-20 flex w-full flex-col border text-xs tracking-wide shadow-lg">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setDenom('base');
//                   setTokenModal(false);
//                 }}
//                 className="border-default border-b px-2 py-1.5 text-left text-white hover:bg-neutral-700">
//                 {baseToken}
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setDenom('quote');
//                   setTokenModal(false);
//                 }}
//                 className="px-2 py-1.5 text-left text-white hover:bg-neutral-700">
//                 {quoteToken}
//               </button>
//             </div>
//           )}
//         </button>

//         <button
//           onClick={() => setGroupingModal((prev) => !prev)}
//           className="rounded-default relative flex items-center gap-1 bg-[#2B2B2B] px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
//           {grouping}
//           <ChevronDown size={12} />
//           {groupingModal && (
//             <div
//               ref={groupingRef}
//               className="main-bg rounded-default border-default absolute right-0 bottom-6 z-20 flex w-16 flex-col border text-xs tracking-wide shadow-lg">
//               {groupingOptions.map((val) => (
//                 <button
//                   key={val}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setGrouping(val);
//                     setGroupingModal(false);
//                   }}
//                   className="border-default border-b px-2 py-1.5 text-left text-white last:border-0 hover:bg-neutral-700">
//                   {val}
//                 </button>
//               ))}
//             </div>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };
