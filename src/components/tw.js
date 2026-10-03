export const tw = {
  screenLoader: "grid min-h-screen place-items-center bg-nexo",
  brandMark:
    "inline-grid h-[42px] w-[42px] place-items-center rounded-[9px] bg-nexo-lime font-display text-2xl font-extrabold leading-none text-nexo",
  authScreen:
    "grid min-h-screen grid-cols-[minmax(380px,0.92fr)_1.08fr] bg-white max-[620px]:grid-cols-1",
  authPanel:
    "auth-pattern relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-nexo px-[8.3%] py-11 text-[#f1f5ef] max-[620px]:hidden",
  authBrand:
    "flex items-center gap-3 font-display text-[17px] font-extrabold leading-none",
  brandSubtitle:
    "mt-1 block text-[9px] font-semibold tracking-[1px] text-[#9eafa2]",
  authCopy: "my-auto max-w-[510px] py-[70px]",
  eyebrow: "text-[10px] font-bold tracking-[1px] text-[#839087]",
  authEyebrow: "text-nexo-lime",
  authTitle:
    "mb-4 mt-[22px] max-w-[460px] font-display text-[48px] font-bold leading-[1.12]",
  authSubtitle: "m-0 max-w-[370px] text-base leading-[1.7] text-[#bdc9bf]",
  authFoot:
    "flex items-center gap-3 text-[9px] font-bold tracking-[1px] text-[#9eafa2]",
  authOrbit:
    "auth-orbit-dot relative h-[27px] w-[27px] rounded-full border border-[#78927f]",
  authFormSide:
    "grid place-items-center px-[7%] py-12 max-[620px]:min-h-screen max-[620px]:items-start max-[620px]:px-6 max-[620px]:py-[30px]",
  authFormWrap:
    "my-auto w-full max-w-[405px] animate-[settle-in_0.45s_ease_both]",
  mobileBrand:
    "mb-[50px] hidden items-center gap-[9px] font-display text-xs font-extrabold text-[#304236] max-[620px]:flex",
  mobileBrandMark: "h-8 w-8 text-[19px]",
  authFormTitle: "m-0 font-display text-[29px] font-bold leading-tight",
  muted: "mb-7 mt-[10px] text-base text-muted",
  form: "grid gap-[17px]",
  modalForm: "grid gap-[15px]",
  formLabel: "grid gap-2 text-base font-semibold text-[#3e4941]",
  inputWrap:
    "flex h-[46px] items-center gap-2.5 rounded-[5px] border border-[#dfe5dd] px-[13px] text-[#879189]",
  authInput:
    "h-full w-full border-0 bg-transparent text-base text-ink outline-none focus-visible:outline-none",
  input:
    "min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none",
  textarea:
    "min-h-[72px] w-full resize-y rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none",
  button:
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
  buttonPrimary: "bg-nexo text-white hover:bg-nexo-hover",
  buttonSecondary:
    "border-[#dce3da] bg-white text-[#34453a] hover:border-[#c8d3c5] hover:bg-[#f2f5ef]",
  buttonText:
    "inline-flex items-center justify-center gap-1.5 border-0 bg-transparent p-[5px] text-base font-bold text-[#365b42] hover:text-[#70913f]",
  authSubmit: "mt-1 min-h-[47px] w-full justify-between px-4",
  authToggle: "mt-[18px] pl-0",
  authSecure:
    "mt-[38px] flex items-center gap-[7px] text-[13px] text-[#8b958d]",
  error: "m-0 text-sm text-[#b44438]",
  appLayout: "flex min-h-screen",
  sidebar:
    "fixed inset-y-0 left-0 z-[60] flex min-h-screen w-[270px] shrink-0 flex-col bg-nexo px-[17px] pb-[18px] pt-[26px] text-[#eaf0e8] shadow-[18px_0_38px_rgba(10,25,15,0.15)] transition-[translate] duration-200 min-[851px]:relative min-[851px]:z-auto min-[851px]:w-[248px] min-[851px]:shadow-none max-[1100px]:min-[851px]:w-[220px]",
  mobileScrim:
    "fixed inset-0 z-[55] block h-full w-full border-0 bg-[rgba(14,27,18,0.36)] min-[851px]:hidden",
  sidebarBrand:
    "flex w-full items-center gap-3 px-[5px] font-display text-sm font-extrabold leading-none",
  sidebarBrandMark: "h-9 w-9 rounded-lg text-[21px]",
  workspaceLabel:
    "mx-2 mb-[11px] mt-[37px] block text-[9px] font-bold tracking-[1px] text-[#819489]",
  workspaceSwitch:
    "flex min-w-0 items-center gap-2.5 rounded-[5px] border border-[#385646] bg-[#244433] p-[9px] px-2",
  workspaceText: "grid min-w-0 flex-1 gap-1",
  workspaceName:
    "overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#f1f5ef]",
  workspacePlan: "text-xs text-[#9eafa2]",
  workspaceSymbol:
    "grid h-[30px] w-[30px] shrink-0 place-items-center rounded bg-nexo-lime font-display text-sm font-bold text-[#244433]",
  primaryNav: "grid gap-1",
  navSection:
    "mx-2 mb-[11px] mt-[37px] block text-[9px] font-bold tracking-[1px] text-[#819489]",
  navSectionNested:
    "mb-2 ml-2 mt-[31px] block text-[9px] font-bold tracking-[1px] text-[#819489]",
  navLink:
    "relative flex min-h-[42px] items-center gap-[11px] rounded px-[11px] text-base font-medium text-[#b7c4b9] transition hover:bg-[#294735] hover:text-white",
  navLinkActive:
    "bg-[#2a4937] text-nexo-lime hover:bg-[#2a4937] hover:text-nexo-lime",
  sidebarBottom: "mt-auto",
  sidebarTip:
    "flex items-center gap-2.5 border-y border-[#355443] px-[9px] py-3",
  tipIcon:
    "grid h-[30px] w-[30px] place-items-center rounded border border-[#486451] text-nexo-lime",
  tipText: "grid gap-1",
  tipTitle: "text-xs text-[#eaf0e8]",
  tipDescription: "text-[11px] text-[#9eafa2]",
  logout:
    "mt-[9px] flex min-h-[39px] w-full items-center gap-2.5 border-0 bg-transparent px-[9px] text-left text-base text-[#b7c4b9] hover:text-white",
  mainArea: "flex min-w-0 flex-1 flex-col",
  topbar:
    "flex h-[62px] shrink-0 items-center justify-between border-b border-[#e5e9e2] bg-[rgba(255,255,255,0.83)] px-[38px] max-[1100px]:px-[26px] max-[850px]:gap-3 max-[620px]:h-14 max-[620px]:basis-14 max-[620px]:px-[15px]",
  iconButton:
    "inline-grid h-[34px] w-[34px] place-items-center rounded border border-transparent bg-transparent text-[#647067] hover:border-[#e5e9e2] hover:bg-[#f8faf6] hover:text-nexo",
  mobileMenu: "hidden max-[850px]:inline-grid max-[850px]:-ml-2",
  mobileClose:
    "hidden max-[850px]:ml-auto max-[850px]:inline-grid max-[850px]:text-[#c8d5c9]",
  breadcrumbs: "mr-auto flex items-center gap-[11px] text-sm text-[#899189]",
  breadcrumbStrong: "font-semibold text-[#344138]",
  breadcrumbSlash: "text-[#c0c7c1]",
  topbarUser: "flex items-center gap-[9px] text-sm text-[#59655c]",
  presence:
    "mr-0.5 h-[7px] w-[7px] rounded-full bg-[#83ba67] shadow-[0_0_0_3px_#eaf3e4]",
  userAvatar:
    "ml-[3px] grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf0e7] text-[#55705e]",
  pageContent:
    "mx-auto w-full max-w-[1500px] flex-1 px-[38px] pb-[22px] pt-9 max-[1100px]:px-[26px] max-[620px]:px-4 max-[620px]:pb-[15px] max-[620px]:pt-[26px] max-[390px]:px-3",
  appFooter:
    "flex justify-between px-[38px] pb-[19px] pt-[14px] text-xs text-[#959e96] max-[1100px]:px-[26px] max-[620px]:px-4 max-[620px]:pb-4 max-[620px]:pt-3 max-[620px]:text-[10px]",
  pageHeading:
    "mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4",
  pageHeadingEyebrow: "mb-[9px] block",
  pageTitle:
    "m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl",
  pageDescription: "mb-0 mt-2 text-base text-muted",
  headingActions: "flex items-center gap-2 max-[620px]:w-full",
  headingAction: "max-[620px]:flex-1",
  fullMobileButton: "max-[620px]:w-full",
  metricGrid:
    "grid grid-cols-[repeat(4,minmax(0,1fr))] rounded-[5px] border border-[#e5e9e2] bg-white max-[850px]:grid-cols-2",
  metricItem:
    "min-h-[139px] min-w-0 border-r border-[#e5e9e2] px-[19px] pb-4 pt-[17px] max-[1100px]:px-[13px] max-[850px]:nth-[2]:border-r-0 max-[850px]:nth-[-n+2]:border-b max-[850px]:nth-[-n+2]:border-[#e5e9e2] max-[620px]:min-h-[124px] max-[620px]:px-3 max-[620px]:py-[13px] max-[390px]:px-[9px] max-[390px]:py-[11px]",
  metricTop:
    "flex items-center justify-between gap-2 text-sm text-[#788278] max-[620px]:items-start max-[620px]:text-xs max-[390px]:gap-[5px]",
  metricIcon:
    "grid h-8 w-8 shrink-0 place-items-center rounded max-[620px]:h-7 max-[620px]:w-7 max-[390px]:h-[25px] max-[390px]:w-[25px]",
  metricMint: "bg-[#e8f4df] text-[#42774c]",
  metricCoral: "bg-[#fcebe5] text-[#bd674f]",
  metricBlue: "bg-[#e9eff9] text-[#5676ad]",
  metricGold: "bg-[#f8f0dd] text-[#ac7b31]",
  metricValue:
    "mt-[15px] block overflow-hidden text-ellipsis whitespace-nowrap font-display text-[23px] font-bold leading-tight text-[#26352b] max-[620px]:text-xl max-[390px]:text-lg",
  metricDetail: "mt-[5px] block text-xs text-[#929a92] max-[620px]:text-[11px]",
  dashboardLower:
    "mt-5 grid grid-cols-[minmax(0,1.8fr)_minmax(260px,0.85fr)] gap-[17px] max-[1100px]:grid-cols-[minmax(0,1.5fr)_minmax(235px,0.85fr)] max-[850px]:grid-cols-1",
  panel: "min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white",
  recentOrders:
    "px-[19px] pb-1 pt-5 max-[620px]:px-3 max-[620px]:pb-[3px] max-[620px]:pt-[17px]",
  sectionHeading: "mb-[18px] flex items-center justify-between gap-3",
  sectionEyebrow: "mb-1.5 block",
  sectionTitle:
    "m-0 font-display text-xl font-bold leading-tight text-[#2d3930]",
  subtleLink:
    "inline-flex items-center gap-1.5 text-sm font-bold text-[#52734e] hover:text-[#70913f]",
  quickPanel:
    "min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[17px] pb-[10px] pt-5 max-[850px]:pb-[13px] max-[620px]:px-[13px] max-[620px]:pb-[10px] max-[620px]:pt-[17px]",
  quickLink:
    "flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb] max-[850px]:min-h-[58px]",
  quickLinkText: "grid min-w-0 flex-1 gap-1",
  quickLinkArrow: "text-[#98a198]",
  quickLinkTitle:
    "overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#364238]",
  quickLinkDescription: "text-xs text-[#8b948b]",
  quickIcon: "grid h-8 w-8 shrink-0 place-items-center rounded",
  todayNote:
    "flex items-center gap-2 pb-[5px] pt-[14px] text-xs text-[#89938a]",
  modulePage: "animate-[settle-in_0.35s_ease_both]",
  moduleSection: "px-[18px] pb-[5px] max-[620px]:px-3",
  listToolbar:
    "flex min-h-[67px] items-center justify-between gap-4 border-b border-[#edf0eb] max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-[13px]",
  listCount: "text-sm text-[#778178]",
  listCountStrong: "font-display text-base font-bold text-[#334138]",
  searchField:
    "flex h-[35px] w-full max-w-[280px] items-center gap-2 rounded border border-[#e1e7de] bg-white px-[10px] text-[#8b958c] max-[620px]:max-w-full",
  searchInput:
    "min-w-0 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-[#a1a9a1] focus-visible:outline-none",
  tableFilters:
    "flex items-center gap-2 max-[620px]:w-full max-[620px]:flex-col max-[620px]:items-stretch",
  filterSelect:
    "min-h-[35px] rounded border border-[#e1e7de] bg-white px-[10px] pr-[27px] text-sm text-[#546056] max-[620px]:w-full",
  tableWrap: "w-full overflow-x-auto",
  table: "table-mobile-cards w-full border-collapse text-left whitespace-nowrap",
  th: "h-[39px] border-b border-[#edf0eb] text-xs font-bold tracking-[.5px] text-[#929a92]",
  td: "h-[57px] border-b border-[#f0f2ee] text-sm text-[#707b72]",
  rowLast: "[&:last-child_td]:border-b-0",
  rowHover: "[&:hover]:bg-[#fbfcfa]",
  alignRight: "text-right",
  cellStrong: "font-bold text-[#3a473d]",
  personCell: "flex items-center gap-2.5",
  personAvatar:
    "grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-[#ecf2e9] font-display text-xs font-bold text-[#46684c]",
  productCell: "flex items-center gap-2.5",
  productSymbol:
    "grid h-[31px] w-[31px] shrink-0 place-items-center rounded bg-[#f8f0dd] font-display text-xs font-bold text-[#a57931]",
  rowActions: "inline-flex items-center gap-[5px]",
  tableAction:
    "rounded-sm border-0 bg-transparent px-[7px] py-1.5 text-sm font-semibold text-[#55734d] hover:bg-[#eff5e9]",
  orderDetailsTrigger:
    "rounded-sm border-0 bg-transparent p-0 text-left font-bold text-[#3a473d] hover:text-[#55734d] hover:underline",
  dangerAction: "text-[#ae6257] hover:bg-[#fff0ec]",
  statusBadge:
    "inline-flex min-h-[23px] items-center rounded-sm border-0 px-2 text-xs font-bold",
  statusSelect:
    "inline-flex h-[30px] min-h-[23px] max-w-[135px] cursor-pointer items-center rounded-sm border-0 px-2 pr-[23px] text-xs font-bold",
  statusPending: "bg-[#faf2de] text-[#956b25]",
  statusProcessing: "bg-[#eaf0fa] text-[#4f6da5]",
  statusCompleted: "bg-[#e9f3e5] text-[#407249]",
  statusCancelled: "bg-[#fbece8] text-[#a95a4e]",
  tableSubline: "mt-1 block text-xs text-[#959d95]",
  stockCount:
    "inline-block rounded-sm bg-[#edf4e8] px-[7px] py-[5px] text-xs font-bold text-[#52754e]",
  stockLow: "bg-[#faf1df] text-[#a66d2d]",
  emptyState:
    "flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center",
  emptyTitle: "mt-1 font-display text-base font-bold text-[#3e4d42]",
  emptyDescription: "max-w-[310px] text-sm leading-relaxed text-[#8a948b]",
  emptyLink:
    "mt-[5px] inline-flex items-center gap-[5px] text-sm font-bold text-[#55734d]",
  emptySymbol:
    "grid h-[39px] w-[39px] place-items-center rounded-full border border-[#e2eadc] bg-[#f5f8f2] text-[#607e5c]",
  warning:
    "mb-4 mt-[-11px] rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]",
  inventoryStrip:
    "mb-[17px] grid grid-cols-3 rounded-[5px] border border-[#e5e9e2] bg-white max-[620px]:grid-cols-1",
  inventoryItem:
    "flex min-h-[78px] items-center gap-[11px] border-r border-[#e5e9e2] px-[17px] py-[13px] last:border-r-0 max-[620px]:min-h-[65px] max-[620px]:border-b max-[620px]:border-r-0 max-[620px]:last:border-b-0",
  inventoryText: "grid gap-[5px]",
  inventoryLabel: "text-[11px] font-bold tracking-[.6px] text-[#929b92]",
  inventoryValue: "font-display text-lg font-bold text-[#344238]",
  inventoryIcon:
    "grid h-[33px] w-[33px] place-items-center rounded bg-[#edf4e7] text-[#56734c]",
  inventoryBlue: "bg-[#eaf0f9] text-[#5976a9]",
  inventoryWarn: "bg-[#faf1df] text-[#ac7632]",
  inventoryGreen: "bg-[#eaf3e5] text-[#44714a]",
  modalBackdrop:
    "fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[rgba(20,37,27,0.48)] p-5 animate-[fade-in_0.16s_ease_both]",
  modalPanel:
    "max-h-[min(90vh,850px)] w-full max-w-[480px] overflow-y-auto rounded-md border border-[#e6ebe3] bg-white p-[22px] shadow-[0_20px_65px_rgba(13,30,19,0.22)] max-[620px]:p-[17px]",
  modalWide: "max-w-[690px]",
  modalHeader:
    "sticky top-[-22px] z-[2] -mx-[22px] -mt-[22px] mb-[19px] flex items-start justify-between gap-3 border-b border-[#edf0eb] bg-white px-[22px] pb-[18px] pt-[22px] max-[620px]:-mt-[17px] max-[620px]:top-[-17px] max-[620px]:px-[17px] max-[620px]:pt-[17px]",
  modalTitle: "m-0 font-display text-lg font-bold text-[#2e3b32]",
  modalDescription: "mb-0 mt-1.5 text-sm text-[#858f86]",
  formGrid: "grid grid-cols-1 gap-3 max-[620px]:grid-cols-1",
  modalActions: "flex justify-end gap-2 pt-[7px]",
  orderForm: "grid gap-[13px]",
  orderItemsHeading:
    "flex items-center justify-between gap-1 pt-1 text-base text-[#3b493e] max-[390px]:items-start max-[390px]:gap-1 max-[390px]:text-sm",
  orderItemList: "grid gap-2",
  orderItemRow:
    "grid grid-cols-[minmax(190px,1fr)_92px_105px_30px] items-end gap-[9px] rounded border border-[#e9eee6] bg-[#fafbf9] p-[11px] max-[620px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_28px] max-[620px]:gap-1.5 max-[620px]:p-2 max-[390px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_26px] max-[390px]:gap-1",
  orderProduct: "min-w-0 max-[620px]:col-span-full",
  orderItemField: "min-w-0 max-[620px]:text-sm",
  orderItemInput: "max-[620px]:px-[5px] max-[620px]:text-sm",
  removeItem:
    "mb-0.5 text-[#a65c50] disabled:text-[#c0c7c0] max-[620px]:col-[3] max-[620px]:row-[2]",
  labelWithIcon: "inline-flex items-center gap-[5px]",
  optionalLabel: "font-normal text-[#9ba39b]",
  orderTotal:
    "flex items-center justify-between rounded bg-[#f0f5eb] px-[14px] py-[13px] text-[#4f6453]",
  orderTotalLabel: "inline-flex items-center gap-2 text-sm",
  orderTotalValue: "font-display text-[17px] font-bold text-[#2d4534]",
  orderDetailGrid: "grid grid-cols-2 gap-3 max-[620px]:grid-cols-1",
  orderDetailCard:
    "rounded border border-[#e5e9e2] bg-[#fafbf9] px-3 py-2.5",
  orderDetailLabel: "block text-xs font-semibold text-[#89938a]",
  orderDetailValue: "mt-1 block text-sm font-semibold text-[#344238]",
  orderDetailSection:
    "mt-5 font-display text-base font-bold text-[#344238]",
  orderDetailItems: "mt-2 grid gap-2",
  orderDetailItem:
    "flex flex-wrap items-center justify-between gap-3 rounded border border-[#e9eee6] px-3 py-2.5",
  orderDetailItemName: "font-semibold text-[#344238]",
  orderDetailItemMeta: "mt-1 block text-xs text-[#89938a]",
  orderDetailItemTotal: "font-semibold text-[#344238]",
  orderDetailFooter:
    "mt-4 flex items-center justify-between border-t border-[#e5e9e2] pt-3 text-base font-bold text-[#344238]",
  notice:
    "fixed right-0 top-[-25px] z-[120] flex min-h-[46px] max-w-[min(440px,calc(100vw-32px))] items-center gap-2.5 rounded border border-[#d6e8d1] bg-[#f4faf0] px-[11px] py-[9px] text-base text-[#406b45] shadow-[0_5px_20px_rgba(28,54,35,0.1)] animate-[settle-in_0.2s_ease_both] max-[620px]:right-3 max-[620px]:top-[66px] max-[620px]:max-w-[calc(100vw-24px)]",
  noticeError: "border-[#f0d6d0] bg-[#fff6f3] text-[#a94f42]",
  noticeMessage: "flex-1",
  noticeDismiss:
    "grid h-[25px] w-[25px] place-items-center rounded-sm border-0 bg-transparent p-0 text-inherit hover:bg-[rgba(0,0,0,0.05)]",
};

export function statusClasses(status) {
  const colors = {
    pendente: tw.statusPending,
    processando: tw.statusProcessing,
    concluido: tw.statusCompleted,
    cancelado: tw.statusCancelled,
  };
  return colors[status] || "";
}

export function metricColor(color) {
  const colors = {
    mint: tw.metricMint,
    coral: tw.metricCoral,
    blue: tw.metricBlue,
    gold: tw.metricGold,
  };
  return colors[color] || "";
}

export function inventoryColor(isLow, hasStock = true) {
  if (!hasStock) return tw.inventoryWarn;
  return isLow ? tw.inventoryWarn : tw.inventoryGreen;
}
