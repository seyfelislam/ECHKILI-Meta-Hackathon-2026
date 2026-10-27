"use strict";

// Human-reviewed copy derived from a synthetic Muse Spark 1.3 exercise.
// This only localizes the graph display, never the underlying evidence IDs.
const GRAPH_LOCALES = Object.freeze({
  en: {
    dir: "ltr",
    messages: {
      graphTitle: "Evidence Graph — Demo",
      graphIntro: "Fictional example: every connection has a source. Contradictions cannot establish a real cause.",
      legendObservation: "Observation",
      legendHypothesis: "Provisional explanation",
      legendConflict: "Conflict / withdrawal",
      transcriptTitle: "Readable evidence connections",
      disclaimer: "Fictional illustration, not a validated diagnosis. A connection is not proof of causation or safety.",
      statusAbstain: "Insufficient evidence",
      statusProvisional: "Provisional",
      statusHumanReview: "Human review required",
      svgTitle: "Traceable fictional evidence graph",
      svgDescription: "Synthetic graph with {count} nodes, {edges} connections; state: {state}.",
      edgeSupports: "{ref}: supports unverified explanation {label}.",
      edgeConflict: "Conflict between {ref}; human review required. Fictional observations only.",
      ghostWithdrawn: "{label}: withdrawn after the evidence changed.",
      noEdges: "No supported relationships: the fictional example abstains.",
    },
  },
  fr: {
    dir: "ltr",
    messages: {
      graphTitle: "Graphe des preuves — Démo",
      graphIntro: "Exemple fictif : chaque lien a une source. Une contradiction ne prouve aucune cause réelle.",
      legendObservation: "Observation",
      legendHypothesis: "Explication provisoire",
      legendConflict: "Conflit / retrait",
      transcriptTitle: "Relations entre les preuves, en texte",
      disclaimer: "Illustration fictive, pas un diagnostic validé. Un lien ne prouve ni la cause ni la sécurité.",
      statusAbstain: "Preuves insuffisantes",
      statusProvisional: "Provisoire",
      statusHumanReview: "Examen humain requis",
      svgTitle: "Graphe fictif de preuves traçables",
      svgDescription: "Graphe fictif avec {count} nœuds et {edges} liens ; état : {state}.",
      edgeSupports: "{ref} : étaye l'explication non vérifiée {label}.",
      edgeConflict: "Conflit entre {ref} ; examen humain requis. Observations fictives.",
      ghostWithdrawn: "{label} : explication retirée après modification des preuves.",
      noEdges: "Aucune relation étayée : cet exemple fictif s'abstient.",
    },
  },
  ar: {
    dir: "rtl",
    messages: {
      graphTitle: "مخطط الأدلة — عرض تجريبي",
      graphIntro: "مثال خيالي: لكل علاقة مصدر واضح، والتعارض لا يثبت سببًا حقيقيًا.",
      legendObservation: "ملاحظة",
      legendHypothesis: "تفسير أولي غير مؤكد",
      legendConflict: "تعارض / سحب التفسير",
      transcriptTitle: "شرح نصّي للعلاقات بين الأدلة",
      disclaimer: "رسم توضيحي خيالي، وليس تشخيصًا مثبتًا. العلاقة لا تثبت السبب أو السلامة.",
      statusAbstain: "أدلة غير كافية",
      statusProvisional: "نتيجة أولية",
      statusHumanReview: "تلزم مراجعة بشرية",
      svgTitle: "مخطط خيالي لأدلة قابلة للتتبّع",
      svgDescription: "مخطط اصطناعي يضم {count} عقدة و{edges} علاقة؛ الحالة: {state}.",
      edgeSupports: "{ref}: يدعم التفسير غير المؤكد {label}.",
      edgeConflict: "تعارض بين {ref}؛ تلزم مراجعة بشرية. ملاحظات خيالية.",
      ghostWithdrawn: "{label}: سُحب التفسير بعد تغيّر الأدلة.",
      noEdges: "لا توجد علاقات مدعومة؛ يمتنع المثال الخيالي عن تقديم تفسير.",
    },
  },
});

function validGraphLocale(locale) {
  return Object.hasOwn(GRAPH_LOCALES, locale) ? locale : "en";
}

function graphText(locale, key, variables = {}) {
  const chosen = validGraphLocale(locale);
  const template = GRAPH_LOCALES[chosen].messages[key] || GRAPH_LOCALES.en.messages[key] || "";
  return template.replace(/\{(\w+)\}/g, (placeholder, name) => {
    if (!Object.hasOwn(variables, name)) return placeholder;
    const value = String(variables[name]);
    // Unicode directional isolation keeps technical references readable in RTL.
    return chosen === "ar" && name === "ref" ? `\u2066${value}\u2069` : value;
  });
}

function applyGraphLocale(doc, locale) {
  const chosen = validGraphLocale(locale);
  const panel = doc.getElementById("graph-panel");
  panel.lang = chosen;
  panel.dir = GRAPH_LOCALES[chosen].dir;
  doc.getElementById("graph-canvas").dir = "ltr";
  doc.getElementById("graph-locale").value = chosen;
  const targets = {
    "graph-title": "graphTitle",
    "graph-intro": "graphIntro",
    "graph-legend-observation": "legendObservation",
    "graph-legend-hypothesis": "legendHypothesis",
    "graph-legend-conflict": "legendConflict",
    "graph-transcript-title": "transcriptTitle",
    "graph-disclaimer": "disclaimer",
  };
  for (const [id, key] of Object.entries(targets)) doc.getElementById(id).textContent = graphText(chosen, key);
  return chosen;
}

const ECHKILI_GRAPH_I18N = {locales: GRAPH_LOCALES, graphText, applyGraphLocale};
if (typeof window !== "undefined") window.ECHKILI_GRAPH_I18N = ECHKILI_GRAPH_I18N;
if (typeof module !== "undefined" && module.exports) module.exports = ECHKILI_GRAPH_I18N;
