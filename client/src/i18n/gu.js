// Gujarati language strings
// ──────────────────────────────────────────────────────────────────────────
// IMPORTANT: Every string marked  // TODO: verify translation  has NOT been
// confirmed by a fluent Gujarati speaker. Do NOT remove or alter these
// comments until a fluent speaker approves the string. See AGENTS.md rule 9.
// ──────────────────────────────────────────────────────────────────────────

const gu = {
  // ── App-wide & Navigation ──────────────────────────────────────────────────
  salonName: 'સિટી સલૂન', // TODO: verify translation
  language: 'ભાષા', // TODO: verify translation
  english: 'English',
  gujarati: 'ગુજરાતી',
  currentTime: 'વર્તમાન સમય', // TODO: verify translation
  allRightsReserved: 'સર્વ હક સુરક્ષિત', // TODO: verify translation
  minutes: 'મિ.', // TODO: verify translation
  currency: '₹',
  loading: 'લોડ થઈ રહ્યું છે…', // TODO: verify translation
  errorGeneric: 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.', // TODO: verify translation
  confirm: 'પુષ્ટિ કરો', // TODO: verify translation
  cancel: 'રદ કરો', // TODO: verify translation
  close: 'બંધ કરો', // TODO: verify translation
  save: 'સાચવો', // TODO: verify translation
  delete: 'કાઢી નાખો', // TODO: verify translation
  edit: 'ફેરફાર કરો', // TODO: verify translation

  // ── Staff Authentication ───────────────────────────────────────────────────
  staffLockTitle: 'કર્મચારી પ્રવેશ જરૂરી છે', // TODO: verify translation
  staffLockSubtitle: 'આ સ્ક્રીન જોવા માટે કૃપા કરીને 4 અંકનો સ્ટાફ પિન દાખલ કરો.', // TODO: verify translation
  staffPinLabel: 'સ્ટાફ પિન', // TODO: verify translation
  staffPinPlaceholder: '4 અંકનો પિન દાખલ કરો', // TODO: verify translation
  staffUnlock: 'સ્ક્રીન અનલૉક કરો', // TODO: verify translation
  staffPinInvalid: 'અમાન્ય પિન. ફરી પ્રયાસ કરો.', // TODO: verify translation
  staffDemoPinHint: 'ડેમો પિન: 1234', // TODO: verify translation

  // ── Status labels ─────────────────────────────────────────────────────────
  statusWaiting: 'રાહ જોઈ રહ્યા છે', // TODO: verify translation
  statusCalled: 'બોલાવ્યા', // TODO: verify translation
  statusInChair: 'ખુરશી પર', // TODO: verify translation
  statusDone: 'પૂર્ણ', // TODO: verify translation
  statusCancelled: 'રદ કર્યું', // TODO: verify translation
  statusNoShow: 'ગેરહાજર', // TODO: verify translation

  // ── Home (/) ──────────────────────────────────────────────────────────────
  homeOpen: 'ખુલ્લું', // TODO: verify translation
  homeClosed: 'બંધ', // TODO: verify translation
  homeQueueClosed: 'કતાર બંધ છે', // TODO: verify translation
  homeOnlineQueueClosed: 'ઓનલાઈન કતાર બંધ છે', // TODO: verify translation
  homeJoinQueue: 'કતારમાં જોડાઓ', // TODO: verify translation
  homeCustomersWaiting: 'ગ્રાહકો રાહ જોઈ રહ્યા છે', // TODO: verify translation
  homeEstWait: 'અંદાજિત રાહ', // TODO: verify translation
  homeShortestWait: 'ઓછામાં ઓછી રાહ', // TODO: verify translation
  homeNoBarbersOnDuty: 'આજે કોઈ નાઈ ફરજ પર નથી.', // TODO: verify translation
  homeLiveDataError: 'લાઈવ માહિતી ઉપલબ્ધ નથી — પૃષ્ઠ તાજું કરો.', // TODO: verify translation
  homeBarberAvailable: 'ઉપલબ્ધ', // TODO: verify translation
  homeBarberOnBreak: 'વિરામ પર', // TODO: verify translation
  homeBarberOffDuty: 'ફરજ પર નથી', // TODO: verify translation
  homeLiveSummary: 'કતારની લાઈવ સ્થિતિ', // TODO: verify translation
  homeOnlineClosedBanner: 'ઓનલાઈન જોડાવાનું બંધ થવાના 30 મિનિટ પહેલાં બંધ થાય છે. સ્વાગત ડેસ્ક પર વૉક-ઇન ચાલુ છે.', // TODO: verify translation
  homeStaffPortal: 'સ્ટાફ અને ડિસ્પ્લે લિંક્સ:', // TODO: verify translation
  homeReceptionLink: 'સ્વાગત ડેસ્ક', // TODO: verify translation
  homeTvDisplayLink: 'ટીવી સ્ક્રીન', // TODO: verify translation
  homeAdminLink: 'માલિક એડમિન', // TODO: verify translation
  homeBarberLinks: 'નાઈ સ્ક્રીન:', // TODO: verify translation

  // ── Join Queue (/join) ────────────────────────────────────────────────────
  joinTitle: 'કતારમાં જોડાઓ', // TODO: verify translation
  joinStep1: 'તમારી અંગત વિગતો', // TODO: verify translation
  joinStep2: 'સેવાઓ પસંદ કરો', // TODO: verify translation
  joinStep3: 'નાઈ પસંદ કરો', // TODO: verify translation
  joinStepOf: 'પગલું {step} of 3', // TODO: verify translation
  joinName: 'તમારું પૂરું નામ', // TODO: verify translation
  joinNamePlaceholder: 'તમારું નામ લખો (દા.ત. રાહુલ શર્મા)', // TODO: verify translation
  joinPhone: 'મોબાઇલ નંબર (10 અંક)', // TODO: verify translation
  joinPhonePlaceholder: '10 અંકનો મોબાઇલ નંબર', // TODO: verify translation
  joinPhoneError: 'કૃપા કરીને માન્ય 10 અંકનો મોબાઇલ નંબર દાખલ કરો.', // TODO: verify translation
  joinNameError: 'કૃપા કરીને તમારું નામ લખો.', // TODO: verify translation
  joinMaxServices: 'તમે વધુમાં વધુ 3 સેવાઓ પસંદ કરી શકો છો.', // TODO: verify translation
  joinRunningTotal: 'કુલ રકમ', // TODO: verify translation
  joinEstTime: 'અંદાજિત સેવા સમય', // TODO: verify translation
  joinAnyBarber: 'કોઈ પણ નાઈ (સૌથી ઝડપી)', // TODO: verify translation
  joinAnyBarberDesc: 'પ્રથમ ઉપલબ્ધ નાઈ પાસે વારો મેળવો', // TODO: verify translation
  joinBarberOnBreak: '{name} હાલ વિરામ પર છે — તમારી રાહ વધુ હોઈ શકે છે.', // TODO: verify translation
  joinConfirm: 'પુષ્ટિ કરો અને કતારમાં જોડાઓ', // TODO: verify translation
  joinNext: 'આગળ વધો', // TODO: verify translation
  joinBack: 'પાછળ', // TODO: verify translation
  joinNoServices: 'હાલ કોઈ સેવા ઉપલબ્ધ નથી. કૃપા કરીને સ્વાગત ડેસ્ક પર પૂછો.', // TODO: verify translation
  joinAlreadyInQueue: 'તમે પહેલેથી કતારમાં છો! તમારા ટોકન પર લઈ જઈ રહ્યા છીએ…', // TODO: verify translation
  joinNetworkError: 'તમારી જગ્યા સાચવી શકાઈ નથી — કૃપા ફરી પ્રયાસ કરો.', // TODO: verify translation
  joinSaving: 'તમારી જગ્યા નોંધાઈ રહી છે…', // TODO: verify translation
  joinSummaryTitle: 'કતાર સારાંશ', // TODO: verify translation
  joinEstWaitLive: 'અંદાજિત રાહ સમય', // TODO: verify translation
  joinWaitUnavailable: 'રાહ જોવાનો સમય ઉપલબ્ધ નથી — કૃપા કરીને સ્વાગત ડેસ્ક પર પૂછો.', // TODO: verify translation
  joinClosedNotice: 'ઓનલાઈન કતાર હાલ બંધ છે. સ્વાગત ડેસ્ક પર વૉક-ઇન ઉપલબ્ધ છે.', // TODO: verify translation

  // ── My Status (/status/:id) ───────────────────────────────────────────────
  statusToken: 'ટોકન #{token}', // TODO: verify translation
  statusPosition: 'તમે #{pos} ક્રમ પર છો', // TODO: verify translation
  statusPositionFirst: 'હવે પછી તમારો જ વારો છે!', // TODO: verify translation
  statusEstWait: 'લગભગ {mins} મિનિટ', // TODO: verify translation
  statusWaitUnavailable: 'રાહ જોવાનો સમય ઉપલબ્ધ નથી — કૃપા કરીને સ્વાગત ડેસ્ક પર પૂછો.', // TODO: verify translation
  statusBarberAssigned: 'ફાળવેલ નાઈ: {name}', // TODO: verify translation
  statusSelectedServices: 'પસંદ કરેલી સેવાઓ', // TODO: verify translation
  statusBannerWaiting: 'તમે કતારમાં છો', // TODO: verify translation
  statusBannerReady: 'તૈયાર રહો — તમારો વારો આવવા આવ્યો!', // TODO: verify translation
  statusBannerCalled: 'તમારો વારો આવ્યો! કૃપા કરીને {barber} પાસે જાઓ', // TODO: verify translation
  statusBannerInChair: '{barber} સાથે સેવા ચાલુ છે', // TODO: verify translation
  statusBannerDone: 'તમારી સેવા પૂર્ણ થઈ. મુલાકાત બદલ આભાર!', // TODO: verify translation
  statusBannerCancelled: 'તમે કતાર છોડી દીધી છે. ફરી જોડાવા સ્કેન કરો.', // TODO: verify translation
  statusBannerNoShow: 'ગેરહાજર તરીકે ચિહ્નિત. ફરી જોડાવા સ્વાગત ડેસ્ક પર સંપર્ક કરો.', // TODO: verify translation
  statusCancelLink: 'કતાર છોડો', // TODO: verify translation
  statusCancelTitle: 'કતાર છોડવી છે?', // TODO: verify translation
  statusCancelBody: 'શું તમે ખરેખર કતાર છોડવા માંગો છો? તમારો વારો રદ થશે.', // TODO: verify translation
  statusCancelConfirm: 'હા, કતાર છોડો', // TODO: verify translation
  statusCancelDismiss: 'ના, મારી જગ્યા રાખો', // TODO: verify translation
  statusNotFound: 'આ ટોકન મળ્યું નથી. કદાચ મુદત પૂરી થઈ ગઈ છે અથવા રદ થયું છે.', // TODO: verify translation
  statusRejoinNotice: 'ફરી જોડાવું છે? ક્યુઆર કોડ સ્કેન કરો અથવા હોમ પેજ પર જાઓ.', // TODO: verify translation

  // ── Reception Dashboard (/reception) ─────────────────────────────────────
  receptionTitle: 'સ્વાગત ડેસ્ક', // TODO: verify translation
  receptionSubtitle: 'વૉક-ઇન, કતાર સંચાલન અને નાઈ ફાળવણી', // TODO: verify translation
  receptionAddWalkin: 'વૉક-ઇન ઉમેરો', // TODO: verify translation
  receptionCallNext: 'આગળ બોલાવો', // TODO: verify translation
  receptionCallNextFor: '{name} માટે આગળ બોલાવો', // TODO: verify translation
  receptionNoShow: 'ગેરહાજર ચિહ્નિત કરો', // TODO: verify translation
  receptionCancel: 'જગ્યા રદ કરો', // TODO: verify translation
  receptionQueueClear: 'કતાર ખાલી છે — નવા ગ્રાહક માટે તૈયાર.', // TODO: verify translation
  receptionAllOnBreak: 'બધા નાઈ હાલ વિરામ પર છે.', // TODO: verify translation
  receptionWaitingLabel: 'પ્રતીક્ષા કતાર', // TODO: verify translation
  receptionAvgWait: 'સરેરાશ રાહ', // TODO: verify translation
  receptionNoShowsToday: 'આજના ગેરહાજર', // TODO: verify translation
  receptionServedToday: 'આજે પૂર્ણ થયેલ સેવા', // TODO: verify translation
  receptionOverdue: '૬૦ મિ. થી વધુ રાહ', // TODO: verify translation
  receptionCancelTitle: 'આ ટોકન રદ કરવું છે?', // TODO: verify translation
  receptionCancelBody: '{name} (ટોકન #{token}) ને કતારમાંથી દૂર કરવામાં આવશે.', // TODO: verify translation
  receptionNoShowTitle: 'ગ્રાહકને ગેરહાજર ચિહ્નિત કરવા?', // TODO: verify translation
  receptionNoShowBody: '{name} (ટોકન #{token}) ને ગેરહાજર ગણવા? તેમની ખુરશી તરત ખાલી થશે.', // TODO: verify translation
  receptionNoShowTimeNotice: '{mins} મિ. પહેલાં બોલાવ્યા (૧૦ મિનિટ રાહ સમય)', // TODO: verify translation
  receptionConfirm: 'પુષ્ટિ કરો', // TODO: verify translation
  receptionDismiss: 'રદ', // TODO: verify translation
  receptionNoCustomers: '{barber} માટે કોઈ ગ્રાહક રાહ જોઈ રહ્યો નથી.', // TODO: verify translation
  receptionBarberInService: 'ટોકન #{token} ની સેવા ચાલુ', // TODO: verify translation
  receptionBarberBreak: 'વિરામ પર', // TODO: verify translation
  receptionBarberAvailable: 'ઉપલબ્ધ', // TODO: verify translation
  receptionCustomerName: 'ગ્રાહક', // TODO: verify translation
  receptionPhone: 'મોબાઇલ', // TODO: verify translation
  receptionServices: 'સેવાઓ', // TODO: verify translation
  receptionBarberPref: 'પસંદગીના નાઈ', // TODO: verify translation
  receptionWaitTime: 'રાહ સમય', // TODO: verify translation
  receptionActions: 'ક્રિયાઓ', // TODO: verify translation
  receptionWalkinDrawerTitle: 'વૉક-ઇન ગ્રાહક નોંધણી', // TODO: verify translation

  // ── Barber View (/barber/:name) ───────────────────────────────────────────
  barberViewTitle: 'નાઈ સ્ટેશન', // TODO: verify translation
  barberAvailable: 'ઉપલબ્ધ', // TODO: verify translation
  barberOnBreak: 'વિરામ પર', // TODO: verify translation
  barberToggleToBreak: 'વિરામ પર જાઓ', // TODO: verify translation
  barberToggleToAvailable: 'ઉપલબ્ધ થાઓ', // TODO: verify translation
  barberCurrentCustomer: 'ખુરશી પર વર્તમાન ગ્રાહક', // TODO: verify translation
  barberNoCurrentCustomer: 'હાલ ખુરશી પર કોઈ ગ્રાહક નથી.', // TODO: verify translation
  barberNextCustomer: 'કતારમાં આગળના ગ્રાહક', // TODO: verify translation
  barberNoNextCustomer: 'તમારા માટે કોઈ રાહ જોઈ રહ્યું નથી.', // TODO: verify translation
  barberStart: 'સેવા શરૂ કરો', // TODO: verify translation
  barberDone: 'સેવા પૂર્ણ કરો', // TODO: verify translation
  barberHistory: 'તાજેતરમાં પૂર્ણ કરેલા ટોકન', // TODO: verify translation
  barberNotFound: 'નાઈ સ્ટેશન મળ્યું નથી. URL ચકાસો.', // TODO: verify translation
  barberServiceTimer: 'સેવા ટાઈમર', // TODO: verify translation
  barberCustomerToken: 'ટોકન #{token}', // TODO: verify translation
  barberServicesList: 'કરવાની સેવાઓ:', // TODO: verify translation

  // ── TV Display (/display) ─────────────────────────────────────────────────
  displayTitle: 'લાઈવ કતાર ડિસ્પ્લે', // TODO: verify translation
  displayNextUp: 'કતારમાં આગળ', // TODO: verify translation
  displayFree: 'ઉપલબ્ધ', // TODO: verify translation
  displayServing: 'સેવા #{token}', // TODO: verify translation
  displayQueueEmpty: 'કતાર હાલ ખાલી છે', // TODO: verify translation
  displaySalonClosed: 'સલૂન હાલ બંધ છે', // TODO: verify translation
  displayJustCalled: 'હવે બોલાવ્યા છે', // TODO: verify translation
  displayPosition: 'ક્રમ', // TODO: verify translation
  displayTokenHeader: 'ટોકન', // TODO: verify translation
  displayEstWaitHeader: 'અંદ. રાહ', // TODO: verify translation

  // ── Owner Settings (/admin) ───────────────────────────────────────────────
  adminTitle: 'માલિક સંચાલન સેટિંગ્સ', // TODO: verify translation
  adminSubtitle: 'સેવાઓ, સ્ટાફ, સમયપત્રક અને આજના આંકડાઓનું સંચાલન', // TODO: verify translation
  adminServices: 'સેવાઓ અને ભાવ', // TODO: verify translation
  adminAddService: 'નવી સેવા ઉમેરો', // TODO: verify translation
  adminEditService: 'સેવામાં સુધારો', // TODO: verify translation
  adminDeleteService: 'કાઢી નાખો', // TODO: verify translation
  adminSave: 'સાચવો', // TODO: verify translation
  adminCancelEdit: 'રદ', // TODO: verify translation
  adminServiceNameEn: 'નામ (અંગ્રેજી)', // TODO: verify translation
  adminServiceNameGu: 'નામ (ગુજરાતી)', // TODO: verify translation
  adminDuration: 'સમય (મિનિટ)', // TODO: verify translation
  adminPrice: 'ભાવ (₹)', // TODO: verify translation
  adminEnabled: 'સક્રિય', // TODO: verify translation
  adminDeleteServiceTitle: 'સેવા કાઢી નાખવી છે?', // TODO: verify translation
  adminDeleteServiceBody: 'શું તમે ખરેખર આ સેવા કાયમ માટે કાઢી નાખવા માંગો છો?', // TODO: verify translation
  adminDeleteServiceActive: 'કાઢી શકાતું નથી — આ સેવા સક્રિય કતારમાં વપરાયેલી છે.', // TODO: verify translation
  adminBarbers: 'ફરજ પર નાઈ', // TODO: verify translation
  adminAddBarber: 'નાઈ ઉમેરો', // TODO: verify translation
  adminBarberName: 'નાઈનું નામ', // TODO: verify translation
  adminOnDuty: 'આજે ફરજ પર', // TODO: verify translation
  adminHours: 'સાપ્તાહિક ખુલવાનો સમય', // TODO: verify translation
  adminOnlineQueue: 'ઓનલાઈન કતાર મુખ્ય સ્વિચ', // TODO: verify translation
  adminOnlineQueueOpen: 'ઓનલાઈન કતાર ખુલ્લી છે', // TODO: verify translation
  adminOnlineQueueClosed: 'ઓનલાઈન કતાર બંધ છે', // TODO: verify translation
  adminOnlineQueueNote: 'ઓનલાઈન જોડાવાનું દરરોજ બંધ થવાના 30 મિનિટ પહેલાં આપમેળે બંધ થઈ જાય છે.', // TODO: verify translation
  adminDayOpen: 'ખુલ્લું', // TODO: verify translation
  adminOpenTime: 'ખુલવાનો સમય', // TODO: verify translation
  adminCloseTime: 'બંધ થવાનો સમય', // TODO: verify translation
  adminStats: 'આજના કામગીરીના આંકડા', // TODO: verify translation
  adminServed: 'આજે સેવા અપાઈ', // TODO: verify translation
  adminAvgWait: 'સરેરાશ રાહ (મિનિટ)', // TODO: verify translation
  adminNoShows: 'આજના ગેરહાજર', // TODO: verify translation
  adminNoServices: 'કોઈ સેવા ગોઠવેલી નથી. તમારી પ્રથમ સેવા ઉમેરો.', // TODO: verify translation
  adminNoBarbers: 'કતાર ખોલતા પહેલાં ઓછામાં ઓછો એક નાઈ ઉમેરો.', // TODO: verify translation
  adminDays: {
    Monday: 'સોમવાર', // TODO: verify translation
    Tuesday: 'મંગળવાર', // TODO: verify translation
    Wednesday: 'બુધવાર', // TODO: verify translation
    Thursday: 'ગુરુવાર', // TODO: verify translation
    Friday: 'શુક્રવાર', // TODO: verify translation
    Saturday: 'શનિવાર', // TODO: verify translation
    Sunday: 'રવિવાર', // TODO: verify translation
  }
};

export default gu;
