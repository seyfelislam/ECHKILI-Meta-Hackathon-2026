"use strict";

// Human-reviewed Muse Wonder 1.0 synthetic-copy exercise (no customer data).
// UI labels only: the canonical graph and evidence rules are never localized
// by modifying their IDs, evidence citations, or safety decisions.
const RESULT_LOCALES = Object.freeze({
  en: Object.freeze({
    modeOffline: "TRANSPARENT OFFLINE RULES",
    modeRemoteAccepted: "OFFLINE + UNVERIFIED META NOTES",
    modeRemoteRejected: "OFFLINE · NO REMOTE NOTES ACCEPTED",
    cautionTitle: "ESTIMATED UNCERTAINTY · NOT A PROBABILITY",
    cautionBody: "Uncalibrated fictional caution score for this teaching example; not a statistical estimate, confidence percentage, or decision threshold.",
    findingsTitle: "PROVISIONAL HYPOTHESES",
    insufficientTitle: "Not enough consistent evidence",
    insufficientBody: "The fictional example abstains from a specific explanation. Review the selected observations or request human review.",
    verificationUnverified: "Unverified · requires independent human assessment",
    conflictTitle: "CONTRADICTIONS DETECTED",
    conflictItem: "Conflicting fictional observations",
    safetyTitle: "SAFETY & LIMITATIONS",
    safetyReview: "Qualified human review is required before forming a conclusion from contradictory records.",
    safetyNotice: "Fictional educational exercise only; do not use it to decide real-world actions.",
    remoteNotesTitle: "REMOTE MODEL NOTES · UNVERIFIED",
    remoteNotesBody: "Optional external suggestions are not canonical hypotheses or evidence graph edges. Cited records do not establish independent corroboration or a diagnosis.",
    remoteNoteStatus: "Remote note · unverified · not a second source",
    remoteCitations: "CITED SELECTED IDS (NOT VERIFIED)",
    changeTitle: "EVIDENCE UPDATE · SINCE LAST ANALYSIS",
    addedIds: "Added: {ids}",
    removedIds: "Removed: {ids}",
    newFindingsCount: "New provisional explanations: {count}",
    withdrawnFindingsCount: "Withdrawn, inactive explanations: {count}",
    conflictDelta: "Contradiction change: {delta}",
    sourceServerTrace: "SOURCE: SERVER-VERIFIED OFFLINE TRACE",
    sourceLocalComparison: "SOURCE: LOCAL VIEW COMPARISON",
    cautionUpdate: "Illustrative caution score, not a probability: {before} → {after}",
    analysisErrorTitle: "Analysis unavailable",
    analyzeButton: "Analyze selected evidence",
    analyzeBusy: "Analyzing…",
  }),
  fr: Object.freeze({
    modeOffline: "Mode hors ligne : analyse locale uniquement",
    modeRemoteAccepted: "Note distante reçue, non vérifiée",
    modeRemoteRejected: "Aucune note distante retenue",
    cautionTitle: "Indice de prudence — pas une probabilité",
    cautionBody: "Valeur fictive affichée sur 1.00. Ce n’est ni une probabilité ni un niveau de confiance ; elle invite seulement à examiner les preuves avec prudence.",
    findingsTitle: "Hypothèses provisoires",
    insufficientTitle: "Preuves insuffisantes",
    insufficientBody: "Les observations fictives fournies ne permettent pas de retenir une hypothèse. Aucune conclusion n’est proposée.",
    verificationUnverified: "Non vérifié — examen indépendant nécessaire",
    conflictTitle: "Enregistrements contradictoires",
    conflictItem: "Observations fictives contradictoires",
    safetyTitle: "Limites de sécurité",
    safetyReview: "Examen humain requis : en cas de contradiction, ne concluez pas automatiquement et faites examiner les sources par une personne qualifiée.",
    safetyNotice: "Démo éducative fictive. Ne l’utilisez pas pour décider d’une action réelle.",
    remoteNotesTitle: "Notes du modèle externe — non vérifiées",
    remoteNotesBody: "Ces suggestions facultatives ne sont ni des hypothèses de référence ni des liens du graphe. Les références citées ne les confirment pas.",
    remoteNoteStatus: "Note non vérifiée — ne vaut pas seconde source",
    remoteCitations: "Identifiants cités (non vérifiés)",
    changeTitle: "Changements des observations",
    addedIds: "Ajoutées : {ids}",
    removedIds: "Retirées : {ids}",
    newFindingsCount: "Nouvelles hypothèses provisoires : {count}",
    withdrawnFindingsCount: "Hypothèses retirées, désormais inactives : {count}",
    conflictDelta: "Évolution des contradictions : {delta}",
    sourceServerTrace: "Source : trace du serveur de démonstration",
    sourceLocalComparison: "Source : comparaison locale hors ligne",
    cautionUpdate: "Indice de prudence : de {before} à {after} (illustratif, non probabiliste)",
    analysisErrorTitle: "L’analyse n’a pas pu aboutir",
    analyzeButton: "Analyser les observations fictives",
    analyzeBusy: "Analyse en cours…",
  }),
  ar: Object.freeze({
    modeOffline: "الوضع غير المتصل: تحليل محلي فقط",
    modeRemoteAccepted: "تم استلام ملاحظة خارجية غير موثّقة",
    modeRemoteRejected: "لم تُعتمد ملاحظات خارجية",
    cautionTitle: "مؤشر حذر توضيحي — ليس احتمالًا",
    cautionBody: "قيمة خيالية معروضة من أصل 1.00. ليست احتمالًا ولا مستوى ثقة؛ بل تنبّه فقط إلى ضرورة الحذر عند مراجعة الأدلة.",
    findingsTitle: "فرضيات مؤقتة",
    insufficientTitle: "الأدلة غير كافية",
    insufficientBody: "لا تسمح الملاحظات الخيالية المقدَّمة باعتماد أي فرضية. لا يُقترح أي استنتاج.",
    verificationUnverified: "غير مؤكّدة — يلزم تحقق بشري مستقل",
    conflictTitle: "سجلات متعارضة",
    conflictItem: "ملاحظات خيالية متعارضة",
    safetyTitle: "حدود السلامة",
    safetyReview: "تلزم مراجعة بشرية مؤهلة عند وجود تعارض؛ لا تستنتج نتيجة تلقائية من سجلات متضاربة.",
    safetyNotice: "عرض تعليمي خيالي. لا تستخدمه لاتخاذ قرار بشأن إجراء حقيقي.",
    remoteNotesTitle: "ملاحظات نموذج خارجي — غير موثّقة",
    remoteNotesBody: "هذه اقتراحات اختيارية لا تدخل في الفرضيات المرجعية أو علاقات المخطط؛ وذكر المراجع لا يثبت صحتها.",
    remoteNoteStatus: "ملاحظة غير موثّقة — لا تُعدّ مصدرًا ثانيًا",
    remoteCitations: "معرّفات مذكورة (غير مؤكدة)",
    changeTitle: "تغيّرات الملاحظات",
    addedIds: "أُضيفت: {ids}",
    removedIds: "أُزيلت: {ids}",
    newFindingsCount: "فرضيات مؤقتة جديدة: {count}",
    withdrawnFindingsCount: "فرضيات مسحوبة ولم تعد نشطة: {count}",
    conflictDelta: "تغيّر التعارضات: {delta}",
    sourceServerTrace: "المصدر: أثر خادم العرض",
    sourceLocalComparison: "المصدر: مقارنة محلية غير متصلة",
    cautionUpdate: "مؤشر الحذر: من {before} إلى {after} (توضيحي، ليس احتمالًا)",
    analysisErrorTitle: "تعذّر إكمال التحليل",
    analyzeButton: "تحليل الملاحظات الخيالية",
    analyzeBusy: "جارٍ التحليل…",
  }),
});

function validResultLocale(locale) {
  return Object.hasOwn(RESULT_LOCALES, locale) ? locale : "en";
}

function resultText(locale, key) {
  const selected = RESULT_LOCALES[validResultLocale(locale)];
  return selected[key] || RESULT_LOCALES.en[key] || "";
}

const ECHKILI_RESULT_I18N = {locales: RESULT_LOCALES, validResultLocale, resultText};
if (typeof window !== "undefined") window.ECHKILI_RESULT_I18N = ECHKILI_RESULT_I18N;
if (typeof module !== "undefined" && module.exports) module.exports = ECHKILI_RESULT_I18N;
