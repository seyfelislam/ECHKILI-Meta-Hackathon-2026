"use strict";

// Public synthetic fixture display copy; derived from one user-approved Muse
// Wonder experiment and human-reviewed for diagnostic and source-count claims.
// Only display strings are localized. Evidence IDs and inference never change.
const SITE_STATIC = Object.freeze({
  "en": {
    "heroEyebrow": "META GLOBAL AI DEVELOPER HACKATHON 2026",
    "heroLine1": "When evidence disagrees,",
    "heroLine2": "clarity matters.",
    "heroLead": "Explore a fictional system through traceable observations, provisional explanations, and explicit uncertainty. No black-box certainty. No unsafe repair advice.",
    "chipSource": "Source-aware",
    "chipConflict": "Contradiction-sensitive",
    "chipHuman": "Human-reviewed",
    "workspaceTitle": "Explore the case",
    "syntheticBadge": "100% SYNTHETIC DATA",
    "storyEyebrow": "JUDGE DEMO · 3 STEPS · LOCAL ONLY",
    "storyTitle": "Watch the reasoning change when new evidence arrives.",
    "storyReady": "Ready: supporting evidence → corroboration → contradiction & human review",
    "storyStep1": "Step 1/3: Initial evidence — First evidence-linked possibility",
    "storyStep2": "Step 2/3: New supporting record — A second provisional explanation appears",
    "storyStep3": "Step 3/3: Conflicting report — Withdraw affected explanation; require review",
    "storyButtonStart": "Start guided demonstration",
    "storyButtonNext": "Next evidence step",
    "storyButtonReplay": "Replay guided demonstration",
    "evidenceTitle": "Choose observations",
    "evidenceIntro": "Toggle any evidence cards to see what a transparent analysis can — and cannot — conclude.",
    "scenarioLabel": "SCENARIO / FICTIONAL",
    "observationLegend": "AVAILABLE OBSERVATIONS",
    "presetSupport": "Try supporting evidence",
    "presetConflict": "Try a contradiction",
    "selectionCount": "{selected} of {total} observations selected · Fictional scenario only",
    "resultsIntro": "Every proposed explanation links back to selected evidence; uncertainty remains visible.",
    "principle1Title": "Show the source",
    "principle1Body": "Trace every explanation to the observation that supports it.",
    "principle2Title": "Surface the conflict",
    "principle2Body": "Contradictory records increase caution instead of disappearing.",
    "principle3Title": "Keep humans in control",
    "principle3Body": "Any real-world interpretation requires qualified independent review."
  },
  "fr": {
    "heroEyebrow": "Meta Global AI Developer Hackathon 2026",
    "heroLine1": "Quand les preuves se contredisent,",
    "heroLine2": "la clarté compte.",
    "heroLead": "Explorez un système fictif grâce à des observations traçables, des explications provisoires et une incertitude explicite. Aucune certitude opaque. Aucun conseil de réparation dangereux.",
    "chipSource": "Sources identifiées",
    "chipConflict": "Sensible aux contradictions",
    "chipHuman": "Révision humaine",
    "workspaceTitle": "Explorer le cas",
    "syntheticBadge": "DONNÉES 100 % SYNTHÉTIQUES",
    "storyEyebrow": "DÉMO POUR LE JURY · 3 ÉTAPES · LOCAL UNIQUEMENT",
    "storyTitle": "Observez le raisonnement évoluer à l’arrivée de nouvelles preuves.",
    "storyReady": "Prêt : preuve à l’appui → corroboration → contradiction et révision humaine",
    "storyStep1": "Étape 1/3 : Preuve initiale — Première possibilité liée aux preuves",
    "storyStep2": "Étape 2/3 : Nouvel enregistrement à l’appui — Une deuxième explication provisoire apparaît",
    "storyStep3": "Étape 3/3 : Rapport contradictoire — Retirer l’explication concernée et exiger une révision",
    "storyButtonStart": "Lancer la démonstration guidée",
    "storyButtonNext": "Étape de preuve suivante",
    "storyButtonReplay": "Rejouer la démonstration guidée",
    "evidenceTitle": "Choisir les observations",
    "evidenceIntro": "Activez ou désactivez les cartes de preuves pour voir ce qu’une analyse transparente peut conclure — et ce qu’elle ne peut pas conclure.",
    "scenarioLabel": "SCÉNARIO / FICTION",
    "observationLegend": "OBSERVATIONS DISPONIBLES",
    "presetSupport": "Essayer les preuves à l’appui",
    "presetConflict": "Essayer une contradiction",
    "selectionCount": "{selected} sur {total} observations sélectionnées · Scénario fictif uniquement",
    "resultsIntro": "Chaque explication proposée renvoie aux preuves sélectionnées ; l’incertitude reste visible.",
    "principle1Title": "Montrer la source",
    "principle1Body": "Relier chaque explication à l’observation qui l’étaye.",
    "principle2Title": "Faire apparaître le conflit",
    "principle2Body": "Les enregistrements contradictoires renforcent la prudence au lieu de disparaître.",
    "principle3Title": "Garder le contrôle humain",
    "principle3Body": "Toute interprétation dans le monde réel exige une révision indépendante et qualifiée."
  },
  "ar": {
    "heroEyebrow": "Meta Global AI Developer Hackathon 2026",
    "heroLine1": "عندما تتعارض الأدلة،",
    "heroLine2": "يصبح الوضوح ضروريًا.",
    "heroLead": "استكشف نظامًا خياليًا من خلال ملاحظات قابلة للتتبع وتفسيرات مؤقتة وعدم يقين صريح. لا يقين معتم. لا نصائح إصلاح غير آمنة.",
    "chipSource": "مراعاة المصدر",
    "chipConflict": "حساسية للتعارض",
    "chipHuman": "مراجعة بشرية",
    "workspaceTitle": "استكشاف الحالة",
    "syntheticBadge": "بيانات اصطناعية 100%",
    "storyEyebrow": "عرض تحكيمي · 3 خطوات · محلي فقط",
    "storyTitle": "شاهد كيف يتغير الاستدلال عند وصول أدلة جديدة.",
    "storyReady": "جاهز: دليل مؤيد → دليل معزز → تعارض ومراجعة بشرية",
    "storyStep1": "الخطوة 1/3: الدليل الأولي — أول احتمال مرتبط بالأدلة",
    "storyStep2": "الخطوة 2/3: سجل داعم جديد — يظهر تفسير مؤقت ثانٍ",
    "storyStep3": "الخطوة 3/3: تقرير متعارض — سحب التفسير المتأثر وطلب المراجعة",
    "storyButtonStart": "بدء العرض الإرشادي",
    "storyButtonNext": "خطوة الدليل التالية",
    "storyButtonReplay": "إعادة العرض الإرشادي",
    "evidenceTitle": "اختيار الملاحظات",
    "evidenceIntro": "بدّل بطاقات الأدلة لترى ما يمكن أن يستنتجه تحليل شفاف وما لا يمكنه استنتاجه.",
    "scenarioLabel": "سيناريو / خيالي",
    "observationLegend": "الملاحظات المتاحة",
    "presetSupport": "تجربة الأدلة المؤيدة",
    "presetConflict": "تجربة تعارض",
    "selectionCount": "{selected} من {total} ملاحظات محددة · سيناريو خيالي فقط",
    "resultsIntro": "يرتبط كل تفسير مقترح بالأدلة المحددة؛ ويبقى عدم اليقين ظاهرًا.",
    "principle1Title": "إظهار المصدر",
    "principle1Body": "ربط كل تفسير بالملاحظة التي تدعمه.",
    "principle2Title": "إبراز التعارض",
    "principle2Body": "تزيد السجلات المتعارضة من الحذر بدلًا من أن تختفي.",
    "principle3Title": "إبقاء التحكم للإنسان",
    "principle3Body": "يتطلب أي تفسير واقعي مراجعة مستقلة مؤهلة."
  }
});
const SITE_FIXTURES = Object.freeze({
  "en": {
    "caseTitle": "Fictional Vehicle Cabin Climate Module",
    "caseDescription": "A fictional vehicle cabin climate module has inconsistent reports of airflow and outlet temperature. Explore how evidence changes the diagnostic conversation.",
    "e1": {
      "title": "Warm outlet report",
      "observation": "A simulated passenger note describes warmer-than-expected outlet air.",
      "source": "Invented passenger note"
    },
    "e2": {
      "title": "Reduced airflow",
      "observation": "A synthetic comfort log reports lower-than-usual cabin airflow.",
      "source": "Fictional comfort log"
    },
    "e3": {
      "title": "Intermittent sound",
      "observation": "An invented log reports a brief intermittent sound from the climate module.",
      "source": "Invented maintenance log"
    },
    "e4": {
      "title": "Cool outlet report",
      "observation": "A second fictional note reports cool outlet air during the same interval.",
      "source": "Invented conflicting passenger note"
    },
    "h-flow": {
      "label": "Temperature-and-airflow interaction (illustrative)",
      "goal": "Have a qualified reviewer compare the synthetic outlet-temperature and airflow records."
    },
    "h-intermittent": {
      "label": "Intermittent cabin-comfort condition (illustrative)",
      "goal": "Review fictional time-stamped comfort logs for consistency; no physical intervention is requested."
    },
    "conflict": {
      "reason": "Two synthetic reports disagree on the outlet-air temperature for the same interval.",
      "nextStep": "Have a qualified reviewer reconcile the records before any conclusion."
    }
  },
  "fr": {
    "caseTitle": "Module fictif de climatisation d’habitacle de véhicule",
    "caseDescription": "Un module fictif de climatisation d’habitacle de véhicule présente des rapports incohérents sur le débit d’air et la température de sortie. Explorez comment les preuves font évoluer la discussion d’analyse.",
    "e1": {
      "title": "Rapport d’air chaud en sortie",
      "observation": "Une note fictive d’un passager décrit un air de sortie plus chaud que prévu.",
      "source": "Note de passager inventée"
    },
    "e2": {
      "title": "Débit d’air réduit",
      "observation": "Un journal de confort synthétique signale un débit d’air d’habitacle inférieur à l’habitude.",
      "source": "Journal de confort fictif"
    },
    "e3": {
      "title": "Son intermittent",
      "observation": "Un journal inventé signale un bref son intermittent provenant du module de climatisation.",
      "source": "Journal de maintenance inventé"
    },
    "e4": {
      "title": "Rapport d’air frais en sortie",
      "observation": "Une deuxième note fictive signale un air de sortie frais pendant le même intervalle.",
      "source": "Note de passager contradictoire inventée"
    },
    "h-flow": {
      "label": "Interaction température–débit d’air (illustratif)",
      "goal": "Demander à un examinateur qualifié de comparer les enregistrements synthétiques de température de sortie et de débit d’air."
    },
    "h-intermittent": {
      "label": "Condition intermittente de confort d’habitacle (illustrative)",
      "goal": "Examiner la cohérence des journaux fictifs de confort horodatés ; aucune intervention physique n’est demandée."
    },
    "conflict": {
      "reason": "Deux rapports synthétiques divergent sur la température de l’air de sortie pour le même intervalle.",
      "nextStep": "Demander à un examinateur qualifié de concilier les enregistrements avant toute conclusion."
    }
  },
  "ar": {
    "caseTitle": "وحدة خيالية للتحكم في مناخ مقصورة مركبة",
    "caseDescription": "تُظهر وحدة خيالية للتحكم في مناخ مقصورة مركبة تقارير غير متسقة عن تدفق الهواء ودرجة حرارة المخرج. استكشف كيف تغيّر الأدلة مسار النقاش التحليلي.",
    "e1": {
      "title": "تقرير عن هواء دافئ عند المخرج",
      "observation": "تصف ملاحظة راكب مُختلقة هواء مخرج أدفأ من المتوقع.",
      "source": "ملاحظة راكب مُختلقة"
    },
    "e2": {
      "title": "انخفاض تدفق الهواء",
      "observation": "يُبلغ سجل راحة اصطناعي عن تدفق هواء في المقصورة أقل من المعتاد.",
      "source": "سجل راحة خيالي"
    },
    "e3": {
      "title": "صوت متقطع",
      "observation": "يُبلغ سجل مُختلق عن صوت متقطع قصير من وحدة المناخ.",
      "source": "سجل صيانة مُختلق"
    },
    "e4": {
      "title": "تقرير عن هواء بارد عند المخرج",
      "observation": "تُبلغ ملاحظة خيالية ثانية عن هواء بارد عند المخرج خلال الفترة نفسها.",
      "source": "ملاحظة راكب متعارضة مُختلقة"
    },
    "h-flow": {
      "label": "تفاعل درجة الحرارة وتدفق الهواء (توضيحي)",
      "goal": "أن يقارن مراجع مؤهل سجلات درجة حرارة المخرج وتدفق الهواء الاصطناعية."
    },
    "h-intermittent": {
      "label": "حالة متقطعة لراحة المقصورة (توضيحية)",
      "goal": "مراجعة سجلات الراحة الخيالية المختومة زمنيًا للتحقق من الاتساق؛ لا يُطلب أي تدخل مادي."
    },
    "conflict": {
      "reason": "يختلف تقريران اصطناعيان حول درجة حرارة هواء المخرج للفترة نفسها.",
      "nextStep": "أن يوفّق مراجع مؤهل بين السجلات قبل أي استنتاج."
    }
  }
});

function validSiteLocale(locale) {
  return Object.hasOwn(SITE_STATIC, locale) ? locale : "en";
}

function siteText(locale, key, values = {}) {
  const lang = validSiteLocale(locale);
  const template = SITE_STATIC[lang][key] || SITE_STATIC.en[key] || "";
  return template.replace(/\{(selected|total)\}/g, (slot, name) => {
    if (!Object.hasOwn(values, name)) return slot;
    const value = String(values[name]);
    return lang === "ar" ? `\u2066${value}\u2069` : value;
  });
}

function fixtureText(locale, identifier, field) {
  const lang = validSiteLocale(locale);
  const object = SITE_FIXTURES[lang][identifier] ?? SITE_FIXTURES.en[identifier];
  if (typeof object === "string") return field === undefined ? object : "";
  return object && typeof object[field] === "string" ? object[field] : "";
}

function applySiteStaticCopy(doc, locale) {
  const chosen = validSiteLocale(locale);
  for (const node of doc.querySelectorAll("[data-site-key]")) {
    const key = node.getAttribute("data-site-key");
    node.textContent = siteText(chosen, key);
  }
  return chosen;
}

const ECHKILI_SITE_I18N = {staticCopy:SITE_STATIC,fixtures:SITE_FIXTURES,
  validSiteLocale,siteText,fixtureText,applySiteStaticCopy};
if (typeof window !== "undefined") window.ECHKILI_SITE_I18N = ECHKILI_SITE_I18N;
if (typeof module !== "undefined" && module.exports) module.exports = ECHKILI_SITE_I18N;
