import type { LinkConfig } from "./types.js";

/**
 * Loads the internal linking configuration.
 * For MVP, this returns a hardcoded configuration.
 * TODO: Implement loading from a JSON file in a future version.
 */
export function loadLinkConfig(): LinkConfig {
  // Hardcoded configuration based on PRD example
  const config: LinkConfig = {
    linkMappings: {
      ordbog: [
        {
          keywords: ["ryg", "ryggen", "rygge"],
          destination: "/ordbog/ryg",
        },
        {
          keywords: ["Åndedrætstræning", "aandedraetstraening"],
          destination: "/ordbog/aandedraetstraening",
        },
        {
          keywords: ["Ac Ledsartrose"],
          destination: "/ordbog/ac-ledsartrose",
        },
        {
          keywords: ["Achillessene"],
          destination: "/ordbog/achillessene",
        },
        {
          keywords: ["Ældre", "aeldre"],
          destination: "/ordbog/aeldre",
        },
        {
          keywords: ["Akupunktur"],
          destination: "/ordbog/akupunktur",
        },
        {
          keywords: ["Albue"],
          destination: "/ordbog/albue",
        },
        {
          keywords: ["Angst"],
          destination: "/ordbog/angst",
        },
        {
          keywords: ["Ankel"],
          destination: "/ordbog/ankel",
        },
        {
          keywords: ["Ansigt"],
          destination: "/ordbog/ansigt",
        },
        {
          keywords: ["Apopleksi"],
          destination: "/ordbog/apopleksi",
        },
        {
          keywords: ["Arbejdsskader"],
          destination: "/ordbog/arbejdsskader",
        },
        {
          keywords: ["Arm"],
          destination: "/ordbog/arm",
        },
        {
          keywords: ["Artrose", "Slidgigt"],
          destination: "/ordbog/artrose-slidgigt",
        },
        {
          keywords: ["Arvæv"],
          destination: "/ordbog/arvaev",
        },
        {
          keywords: ["Astma"],
          destination: "/ordbog/astma",
        },
        {
          keywords: ["Autoimmun Sygdom"],
          destination: "/ordbog/autoimmun-sygdom",
        },
        {
          keywords: ["Bækkenbundstræning", "baekkenbundstraening"],
          destination: "/ordbog/baekkenbundstraening",
        },
        {
          keywords: ["Bækkenløsning", "baekkenloesning"],
          destination: "/ordbog/baekkenloesning",
        },
        {
          keywords: ["Bækkensmerter", "baekkensmerter"],
          destination: "/ordbog/baekkensmerter",
        },
        {
          keywords: ["Bakers Cyste"],
          destination: "/ordbog/bakers-cyste",
        },
        {
          keywords: ["Balance"],
          destination: "/ordbog/balance",
        },
        {
          keywords: ["Balde"],
          destination: "/ordbog/balde",
        },
        {
          keywords: ["Ben"],
          destination: "/ordbog/ben",
        },
        {
          keywords: ["Bindevævsskader"],
          destination: "/ordbog/bindevaevsskader",
        },
        {
          keywords: ["Blodcirkulation"],
          destination: "/ordbog/blodcirkulation",
        },
        {
          keywords: ["Blodprop"],
          destination: "/ordbog/blodprop",
        },
        {
          keywords: ["Blodtryk"],
          destination: "/ordbog/blodtryk",
        },
        {
          keywords: ["Bodybuilding"],
          destination: "/ordbog/bodybuilding",
        },
        {
          keywords: ["Børnefysioterapi", "boernefysioterapi"],
          destination: "/ordbog/boernefysioterapi",
        },
        {
          keywords: ["Brud"],
          destination: "/ordbog/brud",
        },
        {
          keywords: ["Bryst"],
          destination: "/ordbog/bryst",
        },
        {
          keywords: ["Brystkasse"],
          destination: "/ordbog/brystkasse",
        },
        {
          keywords: ["Brystmuskulatur"],
          destination: "/ordbog/brystmuskulatur",
        },
        {
          keywords: ["Cerebral Parese"],
          destination: "/ordbog/cerebral-parese",
        },
        {
          keywords: ["Cervikal Spondylose"],
          destination: "/ordbog/cervikal-spondylose",
        },
        {
          keywords: ["Cervikogen Hovedpine"],
          destination: "/ordbog/cervikogen-hovedpine",
        },
        {
          keywords: ["Costotransversal Dysfunktion"],
          destination: "/ordbog/costotransversal-dysfunktion",
        },
        {
          keywords: ["Cupping"],
          destination: "/ordbog/cupping",
        },
        {
          keywords: ["Cykling"],
          destination: "/ordbog/cykling",
        },
        {
          keywords: ["Cystisk Fibrose"],
          destination: "/ordbog/cystisk-fibrose",
        },
        {
          keywords: ["Dehydrering"],
          destination: "/ordbog/dehydrering",
        },
        {
          keywords: ["Depression"],
          destination: "/ordbog/depression",
        },
        {
          keywords: ["Diabetes"],
          destination: "/ordbog/diabetes",
        },
        {
          keywords: ["Discusprolaps I Nakken"],
          destination: "/ordbog/discusprolaps-i-nakken",
        },
        {
          keywords: ["Discusprolaps I Ryggen"],
          destination: "/ordbog/discusprolaps-i-ryggen",
        },
        {
          keywords: ["Diskusdegeneration"],
          destination: "/ordbog/diskusdegeneration",
        },
        {
          keywords: ["Doms Delayed Onset Muscle Soreness"],
          destination: "/ordbog/doms-delayed-onset-muscle-soreness",
        },
        {
          keywords: ["Dopamin"],
          destination: "/ordbog/dopamin",
        },
        {
          keywords: ["Dynamisk Udstrækning", "dynamisk-udstraekning"],
          destination: "/ordbog/dynamisk-udstraekning",
        },
        {
          keywords: ["Dyspnø", "dyspnoe"],
          destination: "/ordbog/dyspnoe",
        },
        {
          keywords: ["Efterfødsel", "efterfoedsel"],
          destination: "/ordbog/efterfoedsel",
        },
        {
          keywords: ["Elektroterapi"],
          destination: "/ordbog/elektroterapi",
        },
        {
          keywords: ["Elitesport"],
          destination: "/ordbog/elitesport",
        },
        {
          keywords: ["Endometriose"],
          destination: "/ordbog/endometriose",
        },
        {
          keywords: ["Ergonomi"],
          destination: "/ordbog/ergonomi",
        },
        {
          keywords: ["Ergoterapi"],
          destination: "/ordbog/ergoterapi",
        },
        {
          keywords: ["Færdselsuheld", "faerdselsuheld"],
          destination: "/ordbog/faerdselsuheld",
        },
        {
          keywords: ["Fascie"],
          destination: "/ordbog/fascie",
        },
        {
          keywords: ["Fascitis"],
          destination: "/ordbog/fascitis",
        },
        {
          keywords: ["Fejlstilling"],
          destination: "/ordbog/fejlstilling",
        },
        {
          keywords: ["Fibrillation"],
          destination: "/ordbog/fibrillation",
        },
        {
          keywords: ["Fibromyalgi"],
          destination: "/ordbog/fibromyalgi",
        },
        {
          keywords: ["Finger"],
          destination: "/ordbog/finger",
        },
        {
          keywords: ["Fitness"],
          destination: "/ordbog/fitness",
        },
        {
          keywords: ["Flade Fødder", "flade-foedder"],
          destination: "/ordbog/flade-foedder",
        },
        {
          keywords: ["Fod"],
          destination: "/ordbog/fod",
        },
        {
          keywords: ["Forkalkning"],
          destination: "/ordbog/forkalkning",
        },
        {
          keywords: ["Forstuvning"],
          destination: "/ordbog/forstuvning",
        },
        {
          keywords: ["Frossen Skulder"],
          destination: "/ordbog/frossen-skulder",
        },
        {
          keywords: ["Funktionel Træning", "funktionel-traening"],
          destination: "/ordbog/funktionel-traening",
        },
        {
          keywords: ["Gangfunktion"],
          destination: "/ordbog/gangfunktion",
        },
        {
          keywords: ["Gangtræning", "gangtraening"],
          destination: "/ordbog/gangtraening",
        },
        {
          keywords: [
            "Gener Relateret Til Kræft",
            "kræft",
            "gener-relateret-til-kraeft",
          ],
          destination: "/ordbog/gener-relateret-til-kraeft",
        },
        {
          keywords: ["Genoptræning", "genoptraening"],
          destination: "/ordbog/genoptraening",
        },
        {
          keywords: ["Glaid Træning", "glaid-traening"],
          destination: "/ordbog/glaid-traening",
        },
        {
          keywords: ["Gluteal Tendinopati"],
          destination: "/ordbog/gluteal-tendinopati",
        },
        {
          keywords: ["Golfalbue"],
          destination: "/ordbog/golfalbue",
        },
        {
          keywords: ["Gravide"],
          destination: "/ordbog/gravide",
        },
        {
          keywords: ["Graviditetstræning", "graviditetstraening"],
          destination: "/ordbog/graviditetstraening",
        },
        {
          keywords: ["Gulvøvelser", "gulvoevelser"],
          destination: "/ordbog/gulvoevelser",
        },
        {
          keywords: ["Gyn Obs"],
          destination: "/ordbog/gyn-obs",
        },
        {
          keywords: ["Hånd", "haand"],
          destination: "/ordbog/haand",
        },
        {
          keywords: ["Håndled", "haandled"],
          destination: "/ordbog/haandled",
        },
        {
          keywords: ["Hælspore", "haelspore"],
          destination: "/ordbog/haelspore",
        },
        {
          keywords: ["Haleben"],
          destination: "/ordbog/haleben",
        },
        {
          keywords: ["Hamstringsskade"],
          destination: "/ordbog/hamstringsskade",
        },
        {
          keywords: ["Handicappede"],
          destination: "/ordbog/handicappede",
        },
        {
          keywords: ["Hestefysioterapi"],
          destination: "/ordbog/hestefysioterapi",
        },
        {
          keywords: ["Hjemmebehandling"],
          destination: "/ordbog/hjemmebehandling",
        },
        {
          keywords: ["Hjerneblødning", "hjernebloedning"],
          destination: "/ordbog/hjernebloedning",
        },
        {
          keywords: ["Hjernerystelse"],
          destination: "/ordbog/hjernerystelse",
        },
        {
          keywords: ["Hjerneskader"],
          destination: "/ordbog/hjerneskader",
        },
        {
          keywords: ["Hjernetræning", "hjernetraening"],
          destination: "/ordbog/hjernetraening",
        },
        {
          keywords: ["Hjernetumor"],
          destination: "/ordbog/hjernetumor",
        },
        {
          keywords: ["Hjerte"],
          destination: "/ordbog/hjerte",
        },
        {
          keywords: ["Hjerteiskæmi", "hjerteiskaemi"],
          destination: "/ordbog/hjerteiskaemi",
        },
        {
          keywords: ["Hjerteklapfejl"],
          destination: "/ordbog/hjerteklapfejl",
        },
        {
          keywords: ["Hjertesygdomme"],
          destination: "/ordbog/hjertesygdomme",
        },
        {
          keywords: ["Hofte"],
          destination: "/ordbog/hofte",
        },
        {
          keywords: ["Hofte Impingement"],
          destination: "/ordbog/hofte-impingement",
        },
        {
          keywords: ["Hoftedysplasi"],
          destination: "/ordbog/hoftedysplasi",
        },
        {
          keywords: ["Hold I Nakken"],
          destination: "/ordbog/hold-i-nakken",
        },
        {
          keywords: ["Hold I Ryggen"],
          destination: "/ordbog/hold-i-ryggen",
        },
        {
          keywords: ["Holdningskorrektion"],
          destination: "/ordbog/holdningskorrektion",
        },
        {
          keywords: ["Hormonbalance"],
          destination: "/ordbog/hormonbalance",
        },
        {
          keywords: ["Hovedpine"],
          destination: "/ordbog/hovedpine",
        },
        {
          keywords: ["Hyaluronsyre"],
          destination: "/ordbog/hyaluronsyre",
        },
        {
          keywords: ["Hydration"],
          destination: "/ordbog/hydration",
        },
        {
          keywords: ["Hyperkyfose"],
          destination: "/ordbog/hyperkyfose",
        },
        {
          keywords: ["Hyperlordose"],
          destination: "/ordbog/hyperlordose",
        },
        {
          keywords: ["Hypermobilitetssyndrom Jhs"],
          destination: "/ordbog/hypermobilitetssyndrom-jhs",
        },
        {
          keywords: ["Hypermobolitet"],
          destination: "/ordbog/hypermobolitet",
        },
        {
          keywords: ["Hypotension"],
          destination: "/ordbog/hypotension",
        },
        {
          keywords: ["Iliotibialbåndssyndrom", "iliotibialbaandssyndrom"],
          destination: "/ordbog/iliotibialbaandssyndrom",
        },
        {
          keywords: ["Immunforsvar"],
          destination: "/ordbog/immunforsvar",
        },
        {
          keywords: ["Impingement"],
          destination: "/ordbog/impingement",
        },
        {
          keywords: ["Inflammation"],
          destination: "/ordbog/inflammation",
        },
        {
          keywords: ["Inkontinens"],
          destination: "/ordbog/inkontinens",
        },
        {
          keywords: ["Iskias"],
          destination: "/ordbog/iskias",
        },
        {
          keywords: ["Isometrisk Træning", "isometrisk-traening"],
          destination: "/ordbog/isometrisk-traening",
        },
        {
          keywords: ["Isotonisk Træning", "isotonisk-traening"],
          destination: "/ordbog/isotonisk-traening",
        },
        {
          keywords: ["Kæbe", "kaebe"],
          destination: "/ordbog/kaebe",
        },
        {
          keywords: ["Kæbespændinger", "kaebespaendinger"],
          destination: "/ordbog/kaebespaendinger",
        },
        {
          keywords: ["Kapsulit"],
          destination: "/ordbog/kapsulit",
        },
        {
          keywords: ["Kardiovaskulær Træning", "kardiovaskulaer-traening"],
          destination: "/ordbog/kardiovaskulaer-traening",
        },
        {
          keywords: ["Karpal Tunnel"],
          destination: "/ordbog/karpal-tunnel",
        },
        {
          keywords: ["Karpaltunnelsyndrom"],
          destination: "/ordbog/karpaltunnelsyndrom",
        },
        {
          keywords: ["Katabolisme"],
          destination: "/ordbog/katabolisme",
        },
        {
          keywords: ["Ketonstoffer"],
          destination: "/ordbog/ketonstoffer",
        },
        {
          keywords: ["Kinesiotape"],
          destination: "/ordbog/kinesiotape",
        },
        {
          keywords: ["Knæ", "knae"],
          destination: "/ordbog/knae",
        },
        {
          keywords: ["Knogleskørhed", "knogleskoerhed"],
          destination: "/ordbog/knogleskoerhed",
        },
        {
          keywords: ["Knyster"],
          destination: "/ordbog/knyster",
        },
        {
          keywords: ["Kol"],
          destination: "/ordbog/kol",
        },
        {
          keywords: ["Kompressionsbehandling"],
          destination: "/ordbog/kompressionsbehandling",
        },
        {
          keywords: ["Konditionsmåling", "konditionsmaaling"],
          destination: "/ordbog/konditionsmaaling",
        },
        {
          keywords: ["Konditionstræning", "konditionstraening"],
          destination: "/ordbog/konditionstraening",
        },
        {
          keywords: ["Korrekt Løfteteknik", "korrekt-loefteteknik"],
          destination: "/ordbog/korrekt-loefteteknik",
        },
        {
          keywords: ["Kost"],
          destination: "/ordbog/kost",
        },
        {
          keywords: ["Kræft", "kraeft"],
          destination: "/ordbog/kraeft",
        },
        {
          keywords: ["Kram Faktorer"],
          destination: "/ordbog/kram-faktorer",
        },
        {
          keywords: ["Kroniske Smerter"],
          destination: "/ordbog/kroniske-smerter",
        },
        {
          keywords: ["Kropsanalyse"],
          destination: "/ordbog/kropsanalyse",
        },
        {
          keywords: ["Kropsbalance"],
          destination: "/ordbog/kropsbalance",
        },
        {
          keywords: ["Kropsbevidsthed"],
          destination: "/ordbog/kropsbevidsthed",
        },
        {
          keywords: ["Kropsholdning"],
          destination: "/ordbog/kropsholdning",
        },
        {
          keywords: ["Kropsvægtstræning", "kropsvaegtstraening"],
          destination: "/ordbog/kropsvaegtstraening",
        },
        {
          keywords: ["Kryoterapi"],
          destination: "/ordbog/kryoterapi",
        },
        {
          keywords: ["Labrumlæsion I Skulderen", "labrumlaesion-i-skulderen"],
          destination: "/ordbog/labrumlaesion-i-skulderen",
        },
        {
          keywords: ["Lændehold", "laendehold"],
          destination: "/ordbog/laendehold",
        },
        {
          keywords: ["Lændesmerter", "laendesmerter"],
          destination: "/ordbog/laendesmerter",
        },
        {
          keywords: ["Lændetræning", "laendetraening"],
          destination: "/ordbog/laendetraening",
        },
        {
          keywords: ["Leddegigt"],
          destination: "/ordbog/leddegigt",
        },
        {
          keywords: ["Ledmobilisering"],
          destination: "/ordbog/ledmobilisering",
        },
        {
          keywords: ["Ledstivhed"],
          destination: "/ordbog/ledstivhed",
        },
        {
          keywords: ["Ligamentskader"],
          destination: "/ordbog/ligamentskader",
        },
        {
          keywords: ["Løb", "loeb"],
          destination: "/ordbog/loeb",
        },
        {
          keywords: ["Løbeanalyse", "loebeanalyse"],
          destination: "/ordbog/loebeanalyse",
        },
        {
          keywords: ["Løbemetodik", "loebemetodik"],
          destination: "/ordbog/loebemetodik",
        },
        {
          keywords: ["Løberknæ", "loeberknae"],
          destination: "/ordbog/loeberknae",
        },
        {
          keywords: ["Lumbalt Facetledssyndrom"],
          destination: "/ordbog/lumbalt-facetledssyndrom",
        },
        {
          keywords: ["Lunge"],
          destination: "/ordbog/lunge",
        },
        {
          keywords: ["Lymfesystem"],
          destination: "/ordbog/lymfesystem",
        },
        {
          keywords: ["Lymfødem", "lymfoedem"],
          destination: "/ordbog/lymfoedem",
        },
        {
          keywords: ["Lyske"],
          destination: "/ordbog/lyske",
        },
        {
          keywords: ["Magnesium"],
          destination: "/ordbog/magnesium",
        },
        {
          keywords: ["Manipulation"],
          destination: "/ordbog/manipulation",
        },
        {
          keywords: ["Marvskader"],
          destination: "/ordbog/marvskader",
        },
        {
          keywords: ["Massageterapi"],
          destination: "/ordbog/massageterapi",
        },
        {
          keywords: ["Mave"],
          destination: "/ordbog/mave",
        },
        {
          keywords: ["Menstruationssmerter"],
          destination: "/ordbog/menstruationssmerter",
        },
        {
          keywords: ["Metabolisme"],
          destination: "/ordbog/metabolisme",
        },
        {
          keywords: ["Migræne", "migraene"],
          destination: "/ordbog/migraene",
        },
        {
          keywords: ["Mobilitet"],
          destination: "/ordbog/mobilitet",
        },
        {
          keywords: ["Morbus Sever"],
          destination: "/ordbog/morbus-sever",
        },
        {
          keywords: ["Motorisk Kontrol"],
          destination: "/ordbog/motorisk-kontrol",
        },
        {
          keywords: ["Musearm"],
          destination: "/ordbog/musearm",
        },
        {
          keywords: ["Muskelatrofi"],
          destination: "/ordbog/muskelatrofi",
        },
        {
          keywords: ["Muskelbalance"],
          destination: "/ordbog/muskelbalance",
        },
        {
          keywords: ["Muskelkramp"],
          destination: "/ordbog/muskelkramp",
        },
        {
          keywords: ["Muskellængde", "muskellaengde"],
          destination: "/ordbog/muskellaengde",
        },
        {
          keywords: ["Muskelopbygning"],
          destination: "/ordbog/muskelopbygning",
        },
        {
          keywords: ["Muskelspændinger", "muskelspaendinger"],
          destination: "/ordbog/muskelspaendinger",
        },
        {
          keywords: ["Muskelsvind"],
          destination: "/ordbog/muskelsvind",
        },
        {
          keywords: ["Muskeltræthed", "muskeltraethed"],
          destination: "/ordbog/muskeltraethed",
        },
        {
          keywords: ["Myofascial Release"],
          destination: "/ordbog/myofascial-release",
        },
        {
          keywords: ["Myoser"],
          destination: "/ordbog/myoser",
        },
        {
          keywords: ["Nakke"],
          destination: "/ordbog/nakke",
        },
        {
          keywords: ["Nedsunken Forfod"],
          destination: "/ordbog/nedsunken-forfod",
        },
        {
          keywords: ["Nerveafklemning"],
          destination: "/ordbog/nerveafklemning",
        },
        {
          keywords: ["Nervebetændelse", "nervebetaendelse"],
          destination: "/ordbog/nervebetaendelse",
        },
        {
          keywords: ["Nerveledning"],
          destination: "/ordbog/nerveledning",
        },
        {
          keywords: ["Nerveregeneration"],
          destination: "/ordbog/nerveregeneration",
        },
        {
          keywords: ["Nervesmerter"],
          destination: "/ordbog/nervesmerter",
        },
        {
          keywords: ["Neurologiske Lidelser"],
          destination: "/ordbog/neurologiske-lidelser",
        },
        {
          keywords: ["Neuromuskulær Træning", "neuromuskulaer-traening"],
          destination: "/ordbog/neuromuskulaer-traening",
        },
        {
          keywords: ["Neuropati"],
          destination: "/ordbog/neuropati",
        },
        {
          keywords: ["Ødem", "oedem"],
          destination: "/ordbog/oedem",
        },
        {
          keywords: ["Øresten", "oeresten"],
          destination: "/ordbog/oeresten",
        },
        {
          keywords: ["Øret", "oeret"],
          destination: "/ordbog/oeret",
        },
        {
          keywords: ["Osteoporose"],
          destination: "/ordbog/osteoporose",
        },
        {
          keywords: ["Overbelastningsskade"],
          destination: "/ordbog/overbelastningsskade",
        },
        {
          keywords: ["Overgangsalder"],
          destination: "/ordbog/overgangsalder",
        },
        {
          keywords: ["Overtræning", "overtraening"],
          destination: "/ordbog/overtraening",
        },
        {
          keywords: ["Parkinson"],
          destination: "/ordbog/parkinson",
        },
        {
          keywords: ["Patellofemoralt Smertesyndrom"],
          destination: "/ordbog/patellofemoralt-smertesyndrom",
        },
        {
          keywords: ["Peroneustendinopati"],
          destination: "/ordbog/peroneustendinopati",
        },
        {
          keywords: ["Pes Anserinus"],
          destination: "/ordbog/pes-anserinus",
        },
        {
          keywords: ["Piriformis Syndrom"],
          destination: "/ordbog/piriformis-syndrom",
        },
        {
          keywords: ["Plica Syndrom I Knæet", "plica-syndrom-i-knaeet"],
          destination: "/ordbog/plica-syndrom-i-knaeet",
        },
        {
          keywords: ["Pludselige Smerter"],
          destination: "/ordbog/pludselige-smerter",
        },
        {
          keywords: ["Postural Træning", "postural-traening"],
          destination: "/ordbog/postural-traening",
        },
        {
          keywords: ["Pronation"],
          destination: "/ordbog/pronation",
        },
        {
          keywords: ["Proteinsyntese"],
          destination: "/ordbog/proteinsyntese",
        },
        {
          keywords: ["Psykiske Problemer"],
          destination: "/ordbog/psykiske-problemer",
        },
        {
          keywords: ["Psykologiske Udfordringer"],
          destination: "/ordbog/psykologiske-udfordringer",
        },
        {
          keywords: ["Ptsd"],
          destination: "/ordbog/ptsd",
        },
        {
          keywords: ["Quadriceps Tendinopati"],
          destination: "/ordbog/quadriceps-tendinopati",
        },
        {
          keywords: ["Rectus Diastase"],
          destination: "/ordbog/rectus-diastase",
        },
        {
          keywords: ["Rehabilitering"],
          destination: "/ordbog/rehabilitering",
        },
        {
          keywords: ["Reposition"],
          destination: "/ordbog/reposition",
        },
        {
          keywords: ["Respiratorisk Fysioterapi"],
          destination: "/ordbog/respiratorisk-fysioterapi",
        },
        {
          keywords: ["Restitution"],
          destination: "/ordbog/restitution",
        },
        {
          keywords: ["Reumatologi"],
          destination: "/ordbog/reumatologi",
        },
        {
          keywords: ["Ribben"],
          destination: "/ordbog/ribben",
        },
        {
          keywords: ["Rodtryk I Nakken"],
          destination: "/ordbog/rodtryk-i-nakken",
        },
        {
          keywords: ["Rodtryk I Ryggen"],
          destination: "/ordbog/rodtryk-i-ryggen",
        },
        {
          keywords: ["Rotationsmuskler"],
          destination: "/ordbog/rotationsmuskler",
        },
        {
          keywords: ["Rotatorcuff"],
          destination: "/ordbog/rotatorcuff",
        },
        {
          keywords: ["Ryg"],
          destination: "/ordbog/ryg",
        },
        {
          keywords: ["Rygholdning"],
          destination: "/ordbog/rygholdning",
        },
        {
          keywords: ["Rygradsskader"],
          destination: "/ordbog/rygradsskader",
        },
        {
          keywords: ["Rygsøjlegigt", "rygsoejlegigt"],
          destination: "/ordbog/rygsoejlegigt",
        },
        {
          keywords: ["Scapulær Dyskinesi", "scapulaer-dyskinesi"],
          destination: "/ordbog/scapulaer-dyskinesi",
        },
        {
          keywords: ["Scheuermanns Sygdom"],
          destination: "/ordbog/scheuermanns-sygdom",
        },
        {
          keywords: ["Selvmyofascial Release"],
          destination: "/ordbog/selvmyofascial-release",
        },
        {
          keywords: ["Senebetændelse", "senebetaendelse"],
          destination: "/ordbog/senebetaendelse",
        },
        {
          keywords: ["Seneirritation"],
          destination: "/ordbog/seneirritation",
        },
        {
          keywords: ["Seneruptur"],
          destination: "/ordbog/seneruptur",
        },
        {
          keywords: ["Seneskedehindebetændelse", "seneskedehindebetaendelse"],
          destination: "/ordbog/seneskedehindebetaendelse",
        },
        {
          keywords: ["Sensorisk Integration"],
          destination: "/ordbog/sensorisk-integration",
        },
        {
          keywords: ["Si Led"],
          destination: "/ordbog/si-led",
        },
        {
          keywords: ["Si Led Blokering"],
          destination: "/ordbog/si-led-blokering",
        },
        {
          keywords: ["Sklerose"],
          destination: "/ordbog/sklerose",
        },
        {
          keywords: ["Skoindlæg", "skoindlaeg"],
          destination: "/ordbog/skoindlaeg",
        },
        {
          keywords: ["Skoliose"],
          destination: "/ordbog/skoliose",
        },
        {
          keywords: ["Skulder"],
          destination: "/ordbog/skulder",
        },
        {
          keywords: ["Skulderinstabilitet"],
          destination: "/ordbog/skulderinstabilitet",
        },
        {
          keywords: ["Skuldersmerter"],
          destination: "/ordbog/skuldersmerter",
        },
        {
          keywords: ["Slatter Osgood Schlatter"],
          destination: "/ordbog/slatter-osgood-schlatter",
        },
        {
          keywords: ["Slidgigt I Fødder", "slidgigt-i-foedder"],
          destination: "/ordbog/slidgigt-i-foedder",
        },
        {
          keywords: ["Slidgigt I Hænder", "slidgigt-i-haender"],
          destination: "/ordbog/slidgigt-i-haender",
        },
        {
          keywords: ["Slidgigt I Tommelfinger"],
          destination: "/ordbog/slidgigt-i-tommelfinger",
        },
        {
          keywords: ["Slidgigt Knæ", "slidgigt-knae"],
          destination: "/ordbog/slidgigt-knae",
        },
        {
          keywords: ["Soft Tissue Manipulation"],
          destination: "/ordbog/soft-tissue-manipulation",
        },
        {
          keywords: ["Spændingshovedpine", "spaendingshovedpine"],
          destination: "/ordbog/spaendingshovedpine",
        },
        {
          keywords: ["Spændingsmigræne", "spaendingsmigraene"],
          destination: "/ordbog/spaendingsmigraene",
        },
        {
          keywords: ["Spinal Stenose"],
          destination: "/ordbog/spinal-stenose",
        },
        {
          keywords: ["Spinalstenose I Nakken"],
          destination: "/ordbog/spinalstenose-i-nakken",
        },
        {
          keywords: ["Spinalstenose I Ryggen"],
          destination: "/ordbog/spinalstenose-i-ryggen",
        },
        {
          keywords: ["Spondylolistese"],
          destination: "/ordbog/spondylolistese",
        },
        {
          keywords: ["Sportsskader"],
          destination: "/ordbog/sportsskader",
        },
        {
          keywords: ["Sportstape"],
          destination: "/ordbog/sportstape",
        },
        {
          keywords: ["Springerknæ", "springerknae"],
          destination: "/ordbog/springerknae",
        },
        {
          keywords: ["Springhofte"],
          destination: "/ordbog/springhofte",
        },
        {
          keywords: ["Stabilisatorer"],
          destination: "/ordbog/stabilisatorer",
        },
        {
          keywords: ["Statiske Øvelser", "statiske-oevelser"],
          destination: "/ordbog/statiske-oevelser",
        },
        {
          keywords: ["Stress"],
          destination: "/ordbog/stress",
        },
        {
          keywords: [
            "Styrketræning For Begyndere",
            "styrketraening-for-begyndere",
          ],
          destination: "/ordbog/styrketraening-for-begyndere",
        },
        {
          keywords: ["Subakromial Bursit"],
          destination: "/ordbog/subakromial-bursit",
        },
        {
          keywords: ["Svag Core"],
          destination: "/ordbog/svag-core",
        },
        {
          keywords: ["Svangsenebetændelse", "svangsenebetaendelse"],
          destination: "/ordbog/svangsenebetaendelse",
        },
        {
          keywords: ["Svangseneproblematik"],
          destination: "/ordbog/svangseneproblematik",
        },
        {
          keywords: ["Svimmelhed"],
          destination: "/ordbog/svimmelhed",
        },
        {
          keywords: ["Synkeforstyrelser"],
          destination: "/ordbog/synkeforstyrelser",
        },
        {
          keywords: ["Syreophobning"],
          destination: "/ordbog/syreophobning",
        },
        {
          keywords: ["Tågang", "taagang"],
          destination: "/ordbog/taagang",
        },
        {
          keywords: ["Taktil Sans"],
          destination: "/ordbog/taktil-sans",
        },
        {
          keywords: ["Taleforstyrelser"],
          destination: "/ordbog/taleforstyrelser",
        },
        {
          keywords: ["Taping Teknikker"],
          destination: "/ordbog/taping-teknikker",
        },
        {
          keywords: ["Tarsaltunnelsyndrom"],
          destination: "/ordbog/tarsaltunnelsyndrom",
        },
        {
          keywords: [
            "Temporomandibulær Dysfunktion",
            "temporomandibulaer-dysfunktion",
          ],
          destination: "/ordbog/temporomandibulaer-dysfunktion",
        },
        {
          keywords: [
            "Tendinopati I Håndled Ecrb De Quervain",
            "tendinopati-i-haandled-ecrb-de-quervain",
          ],
          destination: "/ordbog/tendinopati-i-haandled-ecrb-de-quervain",
        },
        {
          keywords: ["Tendinose"],
          destination: "/ordbog/tendinose",
        },
        {
          keywords: ["Tennisalbue"],
          destination: "/ordbog/tennisalbue",
        },
        {
          keywords: ["Termoterapi"],
          destination: "/ordbog/termoterapi",
        },
        {
          keywords: ["Thoracic Outlet Syndrom"],
          destination: "/ordbog/thoracic-outlet-syndrom",
        },
        {
          keywords: ["Tibialis Posterior Tendinopati"],
          destination: "/ordbog/tibialis-posterior-tendinopati",
        },
        {
          keywords: ["Tinnitus"],
          destination: "/ordbog/tinnitus",
        },
        {
          keywords: ["Torticollis"],
          destination: "/ordbog/torticollis",
        },
        {
          keywords: ["Træning Med Kræft", "traening-med-kraeft"],
          destination: "/ordbog/traening-med-kraeft",
        },
        {
          keywords: ["Traume Uheld"],
          destination: "/ordbog/traume-uheld",
        },
        {
          keywords: ["Triceps Tendinopati"],
          destination: "/ordbog/triceps-tendinopati",
        },
        {
          keywords: ["Triggerpunkter"],
          destination: "/ordbog/triggerpunkter",
        },
        {
          keywords: ["Trochanter Bursit"],
          destination: "/ordbog/trochanter-bursit",
        },
        {
          keywords: ["Trykbølgebehandling", "trykboelgebehandling"],
          destination: "/ordbog/trykboelgebehandling",
        },
        {
          keywords: ["Ubalance I Muskulaturen"],
          destination: "/ordbog/ubalance-i-muskulaturen",
        },
        {
          keywords: ["Udbrændthed", "udbraendthed"],
          destination: "/ordbog/udbraendthed",
        },
        {
          keywords: ["Udholdenhedstræning", "udholdenhedstraening"],
          destination: "/ordbog/udholdenhedstraening",
        },
        {
          keywords: ["Uforklarlige Smerter"],
          destination: "/ordbog/uforklarlige-smerter",
        },
        {
          keywords: ["Underaktiv Muskulatur"],
          destination: "/ordbog/underaktiv-muskulatur",
        },
        {
          keywords: ["Urologi"],
          destination: "/ordbog/urologi",
        },
        {
          keywords: ["Vægtbærende Øvelser", "vaegtbaerende-oevelser"],
          destination: "/ordbog/vaegtbaerende-oevelser",
        },
        {
          keywords: ["Vævsskader", "vaevsskader"],
          destination: "/ordbog/vaevsskader",
        },
        {
          keywords: ["Vejrtrækningsbesvær", "vejrtraekningsbesvaer"],
          destination: "/ordbog/vejrtraekningsbesvaer",
        },
        {
          keywords: ["Vejrtrækningsteknikker", "vejrtraekningsteknikker"],
          destination: "/ordbog/vejrtraekningsteknikker",
        },
        {
          keywords: ["Vener Og Blodkar"],
          destination: "/ordbog/vener-og-blodkar",
        },
        {
          keywords: ["Vestibulær Træning", "vestibulaer-traening"],
          destination: "/ordbog/vestibulaer-traening",
        },
        {
          keywords: ["Vibrationsterapi"],
          destination: "/ordbog/vibrationsterapi",
        },
        {
          keywords: ["Whiplash"],
          destination: "/ordbog/whiplash",
        },
      ],
      blog: [
        {
          keywords: ["diskusprolaps"],
          destination: "/blog/diskusprolaps-6-myter",
        },
      ],
    },
  };

  // Basic validation (ensure linkMappings exists)
  if (
    !config ||
    typeof config.linkMappings !== "object" ||
    config.linkMappings === null
  ) {
    throw new Error(
      "Invalid internal linking configuration: linkMappings is missing or not an object."
    );
  }

  // TODO: Add more robust validation in the future (e.g., check keywords/destination format)

  return config;
}
