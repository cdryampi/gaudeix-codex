from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from storytelling.models import Story, StoryCategorySingleton


class Command(BaseCommand):
    help = "Seed database with high-quality translatable stories about Cabrera de Mar."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding Cabrera de Mar stories..."))

        stories_data = [
            # =====================================================================
            # EXISTING STORIES (preserved and improved where needed)
            # =====================================================================
            {
                "slug": "ilturo-poblado-iberico",
                "historical_period": "Iberian",
                "source_url": "https://www.museudecabrerademar.cat/",
                "source_name": "Museu de Cabrera de Mar",
                "reading_time": 6,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "El Poblat Ibèric d'Ilturo",
                        "summary": "La gran capital dels laietans a les muntanyes de Cabrera de Mar.",
                        "content": "El poblat ibèric d'Ilturo va ser un dels centres polítics i comercials més importants de la regió laietana durant els segles III i II a.C. Situat al turó de la Cadira del Bisbe, oferia una vista estratègica del mar i dels camins interiors. Les excavacions arqueològiques han revelat importants restes de muralles, habitatges amb soterranis, i sistemes complexos d'emmagatzematge de gra.",
                        "audio_transcript": "Benvinguts a Ilturo. Davant vostre teniu els fonaments de la que va ser una de les capitals ibèriques més influents del Maresme. Imagineu el bullici dels comerciants venent ceràmica i vi fa més de dos mil anys.",
                    },
                    "es": {
                        "title": "El Poblado Ibérico de Ilturo",
                        "summary": "La gran capital de los laietanos en las colinas de Cabrera de Mar.",
                        "content": "El poblado ibérico de Ilturo fue uno de los centros políticos y comerciales más importantes de la región laietana durante los siglos III y II a.C. Situado en la colina de la Cadira del Bisbe, ofrecía una vista estratégica del mar y de los caminos interiores. Las excavaciones arqueológicas han revelado restos de murallas, viviendas con sótanos y sistemas complejos de almacenamiento de grano.",
                        "audio_transcript": "Bienvenidos a Ilturo. Ante ustedes tienen los cimientos de la que fue una de las capitales ibéricas más influyentes del Maresme. Imaginen el bullicio de los comerciantes vendiendo cerámica y vino hace más de dos mil años.",
                    },
                    "en": {
                        "title": "The Iberian Settlement of Ilturo",
                        "summary": "The great capital of the Laietani on the hills of Cabrera de Mar.",
                        "content": "The Iberian settlement of Ilturo was one of the most important political and commercial centers of the Laietani region during the 3rd and 2nd centuries BC. Located on the hill of Cadira del Bisbe, it offered a strategic view of the sea and inland pathways. Archaeological excavations have revealed significant remains of walls, houses with basements, and complex grain storage systems.",
                        "audio_transcript": "Welcome to Ilturo. Before you lie the foundations of what was once one of the most influential Iberian capitals in the Maresme region. Imagine the bustle of traders selling pottery and wine more than two thousand years ago.",
                    },
                    "fr": {
                        "title": "Le Site Ibérique d'Ilturo",
                        "summary": "La grande capitale des Laietani sur les collines de Cabrera de Mar.",
                        "content": "Le site ibérique d'Ilturo était l'un des centres politiques et commerciaux les plus importants de la région des Laietani aux IIIe et IIe siècles avant JC. Situé sur la colline de la Cadira del Bisbe, il offrait une vue stratégique sur la mer et les chemins intérieurs. Les fouilles archéologiques ont révélé d'importants vestiges de remparts, de maisons avec sous-sols et de systèmes complexes de stockage des grains.",
                        "audio_transcript": "Bienvenue à Ilturo. Devant vous se trouvent les fondations de ce qui fut l'une des capitales ibériques les plus influentes du Maresme. Imaginez l'animation des marchands vendant de la céramique et du vin il y a plus de deux mille ans.",
                    },
                },
            },
            {
                "slug": "can-modolell-santuario-romano",
                "historical_period": "Roman",
                "source_url": "https://www.museudecabrerademar.cat/",
                "source_name": "Museu de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "El Santuari Romà de Can Modolell",
                        "summary": "Un lloc de culte sagrat dedicat a Mitra i altres divinitats clàssiques.",
                        "content": "Can Modolell és un jaciment arqueològic excepcional que mostra la transició del món pagà al paleocristià. En època romana tardana, es va convertir en un important santuari on es retia culte al déu Mitra, una divinitat d'origen persa molt popular entre els soldats de l'Imperi Romà. Les excavacions han tret a la llum nombrosos altars votius, escultures de marbre i restes d'estructures dedicades als rituals.",
                        "audio_transcript": "Esteu trepitjant terra sagrada romana. Aquí, a Can Modolell, els devots es reunien en la foscor per dur a terme rituals misteriosos dedicats al déu Mitra. Escolteu el silenci de les pedres centenàries.",
                    },
                    "es": {
                        "title": "El Santuario Romano de Can Modolell",
                        "summary": "Un lugar de culto sagrado dedicado a Mitra y otras divinidades clásicas.",
                        "content": "Can Modolell es un yacimiento arqueológico excepcional que muestra la transición del mundo pagano al paleocristiano. En la época romana tardía, se convirtió en un importante santuario donde se rendía culto al dios Mitra, una divinidad de origen persa muy popular entre los soldados del Imperio Romano. Las excavaciones han sacado a la luz altares votivos, esculturas de mármol y restos de estructuras de rituales.",
                        "audio_transcript": "Están pisando tierra sagrada romana. Aquí, en Can Modolell, los devotos se reunían en la oscuridad para realizar misteriosos rituales dedicados al dios Mitra. Escuchen el silencio de las piedras centenarias.",
                    },
                    "en": {
                        "title": "The Roman Sanctuary of Can Modolell",
                        "summary": "A sacred place of worship dedicated to Mithras and other classical deities.",
                        "content": "Can Modolell is an exceptional archaeological site demonstrating the transition from the pagan world to early Christianity. In the late Roman era, it became a major sanctuary where the god Mithras, a Persian deity very popular among Roman Empire soldiers, was worshipped. Excavations have brought to light numerous votive altars, marble sculptures, and remains of ritual structures.",
                        "audio_transcript": "You are standing on sacred Roman soil. Here at Can Modolell, devotees gathered in the dark to perform mysterious rituals dedicated to the god Mithras. Listen to the silence of these ancient stones.",
                    },
                    "fr": {
                        "title": "Le Sanctuaire Romain de Can Modolell",
                        "summary": "Un lieu de culte sacré dédié à Mithra et à d'autres divinités classiques.",
                        "content": "Can Modolell est un site archéologique exceptionnel illustrant la transition du monde païen au premier christianisme. À la fin de l'époque romaine, il est devenu un important sanctuaire où l'on vénérait le dieu Mithra, une divinité d'origine persane très populaire auprès des soldats de l'Empire romain. Les fouilles ont mis au jour de nombreux autels votifs, des sculptures en marbre et des restes de structures rituelles.",
                        "audio_transcript": "Vous foulez une terre romaine sacrée. Ici, à Can Modolell, les fidèles se réunissaient dans l'obscurité pour accomplir de mystérieux rituels dédiés au dieu Mithra. Écoutez le silence de ces pierres séculaires.",
                    },
                },
            },
            {
                "slug": "castell-de-burriac",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Castell_de_Burriac",
                "source_name": "Viquipèdia",
                "reading_time": 8,
                "difficulty": "hard",
                "translations": {
                    "ca": {
                        "title": "El Castell de Burriac",
                        "summary": "La fortalesa medieval que vigila la costa del Maresme des del turó.",
                        "content": "El Castell de Burriac, documentat des de l'any 1017, s'alça majestuós a 392 metres sobre el nivell del mar. Durant segles va ser un punt de defensa clau contra les incursions pirates i un símbol de poder senyorial dels senyors de Burriac. Encara que actualment es troba en ruïnes, la seva imponent torre de l'homenatge i les seves muralles continuen dominant el paisatge de Cabrera de Mar.",
                        "audio_transcript": "Mireu al vostre voltant. Des d'aquesta alçada del Castell de Burriac, els sentinelles del segle XI vigilaven la línia de la costa buscant veles pirates. Sentiu el vent que fa ressò dels antics cavallers.",
                    },
                    "es": {
                        "title": "El Castillo de Burriac",
                        "summary": "La fortaleza medieval que vigila la costa del Maresme desde la colina.",
                        "content": "El Castillo de Burriac, documentado desde el año 1017, se alza majestuoso a 392 metros sobre el nivel del mar. Durante siglos fue un punto de defensa clave contra las incursiones piratas y un símbolo de poder señorial de los señores de Burriac. Aunque actualmente está en ruinas, su imponente torre del homenaje y sus murallas siguen dominando el paisaje de Cabrera de Mar.",
                        "audio_transcript": "Miren a su alrededor. Desde esta altura del Castillo de Burriac, los centinelas del siglo XI vigilaban la línea de la costa buscando velas piratas. Sientan el viento que hace eco de los antiguos caballeros.",
                    },
                    "en": {
                        "title": "The Burriac Castle",
                        "summary": "The medieval fortress keeping watch over the Maresme coast from the hilltop.",
                        "content": "The Burriac Castle, documented since 1017, stands majestically 392 meters above sea level. For centuries, it was a key defense point against pirate raids and a symbol of manorial power for the lords of Burriac. Although currently in ruins, its imposing keep tower and walls continue to dominate the landscape of Cabrera de Mar.",
                        "audio_transcript": "Look around you. From this vantage point of Burriac Castle, 11th-century sentinels scanned the coastline searching for pirate sails. Feel the wind echoing the stories of ancient knights.",
                    },
                    "fr": {
                        "title": "Le Château de Burriac",
                        "summary": "La forteresse médiévale qui surveille la côte du Maresme depuis le sommet de la colline.",
                        "content": "Le château de Burriac, mentionné dès l'an 1017, s'élève majestueusement à 392 mètres d'altitude. Pendant des siècles, il a été un point de défense clé contre les raids pirates et un symbole du pouvoir seigneurial des seigneurs de Burriac. Bien qu'il soit aujourd'hui en ruines, son imposant donjon et ses remparts continuent de dominer le paysage de Cabrera de Mar.",
                        "audio_transcript": "Regardez autour de vous. Depuis cette hauteur du château de Burriac, les sentinelles du XIe siècle surveillaient le littoral à la recherche de voiles pirates. Sentez le vent faire écho aux anciens chevaliers.",
                    },
                },
            },
            {
                "slug": "leyenda-bruja-de-burriac",
                "historical_period": "Legend",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Llegenda de la Bruixa de Burriac",
                        "summary": "La misteriosa història de la bruixa que ajudava els mariners des del castell.",
                        "content": "Explica la llegenda que a les nits de tempesta, una vella bruixa habitava a les ruïnes del castell de Burriac. Lluny de fer encanteris malignes, encenia fogueres a la torre per guiar els pescadors perduts al mar. Diuen que el seu esperit encara vaga pels boscos del voltant i que aquells que la respecten troben flors silvestres fresques en els seus camins.",
                        "audio_transcript": "Escolteu amb atenció el murmuri dels arbres. A prop de les ruïnes, la llegenda de la Bruixa de Burriac recorda una presència misteriosa que ajudava els qui estaven en perill. Una bruixa bona que estimava aquesta muntanya.",
                    },
                    "es": {
                        "title": "La Leyenda de la Bruja de Burriac",
                        "summary": "La misteriosa historia de la bruja que ayudaba a los marineros desde el castillo.",
                        "content": "Cuenta la leyenda que en las noches de tormenta, una vieja bruja habitaba en las ruinas del castillo de Burriac. Lejos de hacer hechizos malignos, encendía hogueras en la torre para guiar a los pescadores perdidos en el mar. Dicen que su espíritu todavía ronda por los bosques de los alrededores y que aquellos que la respetan encuentran flores silvestres frescas en sus caminos.",
                        "audio_transcript": "Escuchen con atención el murmullo de los árboles. Cerca de las ruinas, la leyenda de la Bruja de Burriac recuerda una presencia misteriosa que ayudaba a quienes estaban en peligro. Una bruja buena que amaba esta montaña.",
                    },
                    "en": {
                        "title": "The Legend of the Witch of Burriac",
                        "summary": "The mysterious story of the witch who helped sailors from the castle.",
                        "content": "Legend says that on stormy nights, an old witch lived in the ruins of Burriac Castle. Far from casting evil spells, she lit bonfires on the tower to guide lost fishermen at sea. They say her spirit still wanders the surrounding forests, and those who respect her find fresh wild flowers along their paths.",
                        "audio_transcript": "Listen closely to the whispering trees. Near the ruins, the legend of the Witch of Burriac recalls a mysterious presence that helped those in danger. A kind witch who loved this mountain.",
                    },
                    "fr": {
                        "title": "La Légende de la Sorcière de Burriac",
                        "summary": "L'histoire mystérieuse de la sorcière qui aidait les marins depuis le château.",
                        "content": "La légende raconte que les nuits de tempête, une vieille sorcière vivait dans les ruines du château de Burriac. Loin de jeter de mauvais sorts, elle allumait des feux sur la tour pour guider les pêcheurs égarés en mer. On raconte que son esprit erre encore dans les forêts environnantes et que ceux qui la respectent trouvent des fleurs sauvages fraîches sur leurs chemins.",
                        "audio_transcript": "Écoutez attentivement le murmure des arbres. Près des ruines, la légende de la Sorcière de Burriac rappelle une présence mystérieuse qui venait en aide aux personnes en danger. Une gentille sorcière qui aimait cette montagne.",
                    },
                },
            },
            {
                "slug": "cabrera-modernista",
                "historical_period": "Modern",
                "source_url": "https://patrimoni.gencat.cat/",
                "source_name": "Patrimoni Gencat - Generalitat de Catalunya",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "La Cabrera de Mar Modernista",
                        "summary": "La renaixença arquitectònica d'estiueig del segle XIX i principis del XX.",
                        "content": "A finals del segle XIX, Cabrera de Mar es va convertir en un destí de vacances predilecte de la burgesia barcelonina. Això va provocar la construcció de magnífiques torres d'estiueig d'estil modernista, caracteritzades per les seves formes orgàniques, detalls de ferro forjat, vidrieres de colors i jardins exuberants que encara avui embelleixen els carrers del poble.",
                        "audio_transcript": "Passegeu pels carrers del centre de Cabrera de Mar. Les elegants façanes modernistes que observeu expliquen històries d'estius daurats de la burgesia, de tertúlies als jardins i de dissenys inspirats en la bellesa de la natura.",
                    },
                    "es": {
                        "title": "La Cabrera de Mar Modernista",
                        "summary": "El renacimiento arquitectónico de veraneo del siglo XIX y principios del XX.",
                        "content": "A finales del siglo XIX, Cabrera de Mar se convirtió en un destino vacacional predilecto de la burguesía barcelonesa. Esto propició la construcción de magníficas torres de veraneo de estilo modernista, caracterizadas por sus formas orgánicas, detalles de hierro forjado, vidrieras de colores y exuberantes jardines que aún hoy embellecen las calles del pueblo.",
                        "audio_transcript": "Paseen por las calles del centro de Cabrera de Mar. Las elegantes fachadas modernistas que observan cuentan historias de veranos dorados de la burguesía, de tertulias en los jardines y de diseños inspirados en la belleza de la naturaleza.",
                    },
                    "en": {
                        "title": "Modernist Cabrera de Mar",
                        "summary": "The architectural renaissance of summer houses in the 19th and early 20th centuries.",
                        "content": "In the late 19th century, Cabrera de Mar became a favorite summer destination for the Barcelona bourgeoisie. This led to the construction of magnificent modernist-style summer towers, characterized by their organic shapes, wrought-iron details, stained glass windows, and lush gardens that still beautify the town's streets today.",
                        "audio_transcript": "Stroll through the streets of Cabrera de Mar center. The elegant modernist facades you see tell stories of golden summers of the bourgeoisie, conversations in the gardens, and designs inspired by the beauty of nature.",
                    },
                    "fr": {
                        "title": "Cabrera de Mar Moderniste",
                        "summary": "La renaissance architecturale des maisons de vacances aux XIXe et début du XXe siècles.",
                        "content": "À la fin du XIXe siècle, Cabrera de Mar est devenue une destination estivale privilégiée de la bourgeoisie barcelonaise. Cela a conduit à la construction de magnifiques villas de style moderniste, caractérisées par leurs formes organiques, leurs détails en fer forgé, leurs vitraux et leurs jardins luxuriants qui embellissent aujourd'hui encore les rues de la ville.",
                        "audio_transcript": "Promenez-vous dans les rues du centre de Cabrera de Mar. Les élégantes façades modernistes que vous observez racontent les étés dorés de la bourgeoisie, les discussions dans les jardins et les décors inspirés de la nature.",
                    },
                },
            },
            # ===== NUEVAS HISTORIAS EXISTENTES (added in previous expansion) =====
            # -- PATRIMONI ARQUEOLÒGIC --
            {
                "slug": "termes-romanes-ca-larnau",
                "historical_period": "Roman",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 6,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Termes Romanes de Ca l'Arnau",
                        "summary": "Les termes públiques més antigues d'Hispània, datades entre el 150 i el 75 aC.",
                        "content": "El jaciment de Ca l'Arnau, també conegut com Can Mateu i Can Benet, acull unes de les termes romanes més antigues de tota la península Ibèrica, datades entre els anys 150 i 75 aC. Aquestes termes públiques formaven part d'un nucli urbà d'aproximadament 1 hectàrea que els romans van construir com a nou centre polític i administratiu de la vall de Cabrera. Les excavacions han documentat estructures hidràuliques impressionants, amb sistemes de calefacció i canalitzacions que demostraven un alt nivell d'enginyeria. Aquest nucli es va abandonar voluntàriament als primers decennis del segle I aC quan es va fundar Iluro, l'actual Mataró.",
                        "audio_transcript": "Esteu davant d'un tresor arqueològic: les termes romanes més antigues d'Hispània. Fa més de dos mil anys, aquí els habitants de la vall de Cabrera gaudien de banys públics amb aigua calenta, vestidors i sales de reunió. Imagineu el vapor i les converses que ressonaven entre aquestes parets.",
                    },
                },
            },
            {
                "slug": "villa-romana-can-rodo",
                "historical_period": "Roman",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "La Vil·la Romana de Can Rodon",
                        "summary": "Una explotació agrícola romana amb rics materials arqueològics.",
                        "content": "La vil·la romana de Can Rodon és un jaciment de gran importància per entendre l'organització del territori en època romana a la vall de Cabrera. Aquesta vil·la, que funcionava com una masia actual, era una explotació agrícola dedicada al cultiu de la vinya i la producció d'oli i cereals. Les excavacions han tret a la llum restes d'habitacions, dipòsits i estris de treball que ens parlen de la vida quotidiana dels seus habitants. Les tombes de nobles i guerrers laietanes trobades a Can Rodon de l'Hort demostren la riquesa de la zona en època ibèrica, abans de l'arribada dels romans.",
                        "audio_transcript": "Aquesta plana que veieu davant vostre va ser durant segles un actiu centre agrícola romà. Aquí, a la vil·la de Can Rodon, els colons treballaven la terra i produïen vi i oli que s'exportava per tot el Mediterrani.",
                    },
                },
            },
            {
                "slug": "jaciment-ca-larnau-factoria-romana",
                "historical_period": "Roman",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "El Centre Urbà Romà de Ca l'Arnau",
                        "summary": "El primer nucli polític i administratiu romà de la vall de Cabrera.",
                        "content": "Després de la conquesta romana, el nou poder va decidir construir un centre administratiu a la vall de Cabrera per controlar el territori dels laietans. Aquest nucli, conegut avui com Ca l'Arnau, Can Mateu i Can Benet, ocupava una superfície d'aproximadament 1 hectàrea i acollia el governador, els seus funcionaris, cobradors d'impostos i les elits indígenes que havien col·laborat amb Roma. Les excavacions han documentat importants estructures, incloent les termes públiques, habitatges i sistemes de clavegueram. Aquesta ciutat incipient va ser habitada durant poc més d'un segle, fins que es va decidir fundar una nova ciutat més gran i propera al mar: Iluro, l'actual Mataró.",
                        "audio_transcript": "Imagineu aquesta vall fa dos mil anys. Les autoritats romanes havien establert aquí el seu centre de poder, amb funcionaris, recaptadors d'impostos i soldats. Era el cor administratiu de tota la comarca.",
                    },
                },
            },
            {
                "slug": "torre-iberica-turo-dos-pins",
                "historical_period": "Iberian",
                "source_url": "https://ca.wikipedia.org/wiki/Torre_del_Tur%C3%B3_dels_Dos_Pins",
                "source_name": "Viquipèdia",
                "reading_time": 5,
                "difficulty": "hard",
                "translations": {
                    "ca": {
                        "title": "La Torre Ibèrica del Turó dels Dos Pins",
                        "summary": "Una imponent torre de guaita ibèrica del segle III aC al Parc de la Serralada Litoral.",
                        "content": "La Torre Ibèrica del Turó dels Dos Pins és una construcció defensiva de base rectangular de 12 per 6 metres, situada estratègicament al Parc de la Serralada Litoral. Datada al darrer terç del segle III aC, durant la Segona Guerra Púnica, formava part d'un sistema de vigilància per controlar l'accés al poblat d'Ilduro. La torre, que podia assolir entre 11 i 14 metres d'alçada, estava formada per panys de paret paral·lels amb l'espai intermedi reomplert de pedres. Al voltant s'ha localitzat una necròpolis i restes d'habitacions agrícoles. La seva vida útil va ser curta, d'uns 30 anys, i va ser desmantellada després de la revolta dels laietans l'any 197 aC.",
                        "audio_transcript": "Des d'aquest turó estratègic, els guerrers ibers vigilaven l'horitzó durant la Segona Guerra Púnica. Una torre de 14 metres d'alçada s'alçava aquí, dominant el paisatge i controlant el pas cap a la capital laietana d'Ilduro.",
                    },
                },
            },
            {
                "slug": "necropolis-iberiques-can-rodo",
                "historical_period": "Iberian",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Necròpolis Ibèriques de Cabrera de Mar",
                        "summary": "Tombs de guerrers i nobles laietans a Can Rodon, Can Ros i el Turó dels Dos Pins.",
                        "content": "Les necròpolis ibèriques de Cabrera de Mar, localitzades a Can Rodon de l'Hort, Can Ros i el Turó dels Dos Pins, han proporcionat riquíssims aixovars funeraris que parlen del poder i la riquesa dels laietans. Aquestes tombes contenien objectes de bronze, armes, ceràmiques fines importades i joies que demostren l'existència d'una elit guerrera que controlava el comerç del blat de la plana del Vallès. La necròpolis del Turó dels Dos Pins, descoberta el 1979, ha estat objecte de múltiples excavacions. Les tombes reflecteixen una societat fortament jerarquitzada on els guerrers ocupaven el cim de la piràmide social, protegint la capital d'Ilduro.",
                        "audio_transcript": "Sota la terra d'aquests camps reposen els guerrers laietans. Les joies i armes trobades a les seves tombes parlen d'una societat orgullosa i poderosa que va dominar aquestes terres molt abans de l'arribada dels romans.",
                    },
                },
            },
            {
                "slug": "forns-ceramics-iberics",
                "historical_period": "Iberian",
                "source_url": "https://www.museudecabrerademar.cat/",
                "source_name": "Museu de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Els Forns Ceràmics Ibèrics",
                        "summary": "La producció de ceràmica ibera al Maresme, una tradició mil·lenària.",
                        "content": "Els laietans van ser grans ceramistes. A Cabrera de Mar s'han trobat diversos forns ibèrics dedicats a la producció de grans contenidors ceràmics, especialment àmfores per transportar vi i oli. La ceràmica ibera, de color grisós i sovint decorada amb motius geomètrics, es distingeix per la seva pasta argilosa característica. El procés de cocció en forns de llenya, les altes temperatures, i les tècniques artesanals transmeses de generació en generació feien que cada peça fos única. Les restes de ceràmica ibera i romana es barregen al vessant de Burriac, on encara avui es poden trobar fragments d'àmfores, teules i ceràmiques fines que expliquen la intensa activitat industrial de l'època.",
                        "audio_transcript": "El soroll dels artesans treballant el fang, el foc dels forns cremant llenya, el fum enlairant-se cap al cel. La ceràmica ibera era molt més que atuells: una finestra a la vida quotidiana d'un poble.",
                    },
                },
            },
            {
                "slug": "mitreo-can-modolell",
                "historical_period": "Roman",
                "source_url": "https://ca.wikipedia.org/wiki/Jaciment_de_Can_Modolell",
                "source_name": "Viquipèdia",
                "reading_time": 5,
                "difficulty": "hard",
                "translations": {
                    "ca": {
                        "title": "El Mitreo de Can Modolell: Culte a Mitra",
                        "summary": "El santuari dedicat al déu persa Mitra, descobert a Cabrera de Mar.",
                        "content": "El Mitreo de Can Modolell és un dels pocs santuaris dedicats al culte de Mitra documentats a Catalunya. Mitra, una divinitat d'origen persa, va ser adoptada per l'Imperi Romà i el seu culte es va estendre especialment entre els soldats i comerciants. El santuari de Cabrera de Mar, datat entre els segles II i IV dC, s'ubica dins un criptopòrtic voltat i conserva altar votiu, escultures de marbre i múltiples ofrenes. L'any 1974, una acció furtiva va evidenciar la presència del jaciment, i les excavacions posteriors van revelar aquestes estructures úniques. Després de l'abolició dels cultes pagans, el santuari es va transformar en una capella paleocristiana dedicada a Sant Joan Baptista.",
                        "audio_transcript": "Endinsau-vos en el Mitreo de Can Modolell. En la penombra d'aquest espai sagrat, els fidels del déu Mitra celebraven rituals iniciàtics en un ambient de misteri i devoció. Sentiu l'eco de les seves pregàries.",
                    },
                },
            },
            # -- PATRIMONI MEDIEVAL I MODERN --
            {
                "slug": "esglesia-sant-feliu",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Sant_Feliu_de_Cabrera",
                "source_name": "Viquipèdia",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "L'Església Parroquial de Sant Feliu",
                        "summary": "El temple gòtic tardà del segle XVI que presideix la vida espiritual de Cabrera de Mar.",
                        "content": "L'església de Sant Feliu de Cabrera és el temple parroquial del municipi, documentada per primera vegada l'any 1023. L'edifici actual, d'estil gòtic tardà, va ser iniciat el 1540 i consagrat el 1570. L'estructura interior compta amb una nau central i dues laterals, amb un campanar de torre quadrada que conserva matacans defensius de l'època. Al seu interior destaca un magnífic retaule renaixentista i un orgue contemporani neobarroc. La paret de l'absis va ser recoberta de pintures murals l'any 1965, i als anys setanta es van instal·lar les vidrieres de la façana lateral. El retaule de Sant Joan Baptista, obra de Bernat Martorell, es conserva al Museu Diocesà de Barcelona.",
                        "audio_transcript": "Aquesta església ha estat el cor espiritual de Cabrera de Mar durant gairebé cinc segles. Les seves campanes han marcat el ritme de la vida del poble, des de batejos fins a festes majors. Entrem i descobrim els seus tresors.",
                    },
                },
            },
            {
                "slug": "can-bartomeu-masia",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Can_Bartomeu_(Cabrera_de_Mar)",
                "source_name": "Viquipèdia",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Can Bartomeu: La Masia Gòtica",
                        "summary": "Una masia del segle XV amb finestres gòtiques que testimonia el passat agrícola de Cabrera.",
                        "content": "Can Bartomeu, també coneguda com Can Bertomeu o Can Miralles, és una masia del municipi de Cabrera de Mar que data del segle XV. L'edifici, d'estil gòtic tardà, forma un conjunt rectangular tancat per un barri, amb diverses construccions agrícoles al voltant. La masia principal presenta un portal rodó dovellat i finestres gòtiques de finals del segle XV, així com una torre amb les inicials JM i la data de 1942. A l'interior es conserva una data gravada: «Pau Bertomeu, Pagès, 30.IX.160», que testimonia la nissaga de la família Bertomeu, documentada des del 1716. La masia està inclosa a l'Inventari del Patrimoni Arquitectònic Català.",
                        "audio_transcript": "Aquesta masia centenària ha vist passar generacions de pagesos de Cabrera. Les seves parets de pedra i les finestres gòtiques guarden els secrets de la vida rural al Maresme.",
                    },
                },
            },
            {
                "slug": "masies-historiques-cabrera",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 6,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Masies Històriques de Cabrera de Mar",
                        "summary": "Un recorregut per les masies centenàries que configuren el paisatge rural de Cabrera de Mar.",
                        "content": "Cabrera de Mar compta amb un ric patrimoni de masies històriques que testimonien l'evolució del poblament rural des de l'edat mitjana. Can Bartomeu, amb les seves finestres gòtiques del segle XV, és una de les més emblemàtiques. La masia de Can Feliu, amb orígens medievals, presenta una notable torre de defensa. Can Catà, dins el nucli urbà, conserva elements arquitectònics del segle XVIII. Can Dalmases, també conegut com Cal Conde, és una altra masia de propietat municipal que destaca per la seva arquitectura popular. Can Bruguera, Can Roure i Can Segarra completen el conjunt de masies que han modelat el paisatge agrícola de la vall, envoltades de camps de conreu i boscos de la Serralada Litoral.",
                        "audio_transcript": "Passejant pels camins de Cabrera de Mar, trobareu masies centenàries que emergeixen entre els camps. Cada una explica la història d'una família, d'una terra treballada amb esforç i de tradicions que han perdurat segles.",
                    },
                },
            },
            # -- LEYENDAS Y TRADICIONES --
            {
                "slug": "llegenda-tresor-burriac",
                "historical_period": "Legend",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Llegenda del Tresor de Burriac",
                        "summary": "La història d'un tresor amagat sota el castell que mai ningú ha trobat.",
                        "content": "Explica una antiga llegenda que els senyors de Burriac, en temps de Pere Joan Ferrer, van amagar un immens tresor sota les pedres del castell abans de fugir. Es deia que el tresor estava format per monedes d'or, joies i objectes litúrgics de gran valor, protegit per una maledicció que feia que qualsevol que intentés trobar-lo perdés el camí i es perdés pels boscos. Molts cercadors, atrets per la història, han explorat les ruïnes del castell durant els segles. Algunes nits de lluna plena, diuen, es pot veure una llum blavosa que surt de la torre de l'homenatge, senyal que el tresor encara espera ser descobert sota la muntanya de Burriac.",
                        "audio_transcript": "Al cor de la muntanya de Burriac, sota les pedres del castell, hi ha un tresor que mai ningú ha trobat. Les nits de tempesta, la llum blavosa de l'or enterrat brilla entre les ruïnes, atraient els somiadors.",
                    },
                },
            },
            {
                "slug": "festa-major-sant-feliu",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Festa Major de Sant Feliu",
                        "summary": "La gran celebració anual de Cabrera de Mar amb correfoc, xeringada i baixada d'andròmines.",
                        "content": "La Festa Major de Sant Feliu és la celebració més important de Cabrera de Mar, dedicada al patró del poble, Sant Feliu, l'1 d'agost. Durant dies, el poble s'omple d'actes populars i tradicionals que uneixen cabrerencs de totes les edats. El correfoc, organitzat pels Macabres de Cabrera i els Mansuets de Foc, omple els carrers de foc i pólvora. La popular xeringada fa sortir al carrer a gran part dels veïns. La baixada d'andròmines, una competició on els participants dissenyen vehicles no motoritzats originals per baixar un carrer pendent, s'ha consolidat com un dels esdeveniments més esperats. També hi ha el ball de bastons, introduït el 2013, i la gimcana infantil al camp de futbol.",
                        "audio_transcript": "L'agost arriba i Cabrera de Mar es vesteix de festa. L'olor de pólvora del correfoc omple els carrers, les rialles de la xeringada ressonen per les places, i l'emoció de la baixada d'andròmines fa vibrar el poble sencer.",
                    },
                },
            },
            {
                "slug": "festa-ibero-romana",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Festa Ibero-Romana de Cabrera de Mar",
                        "summary": "Una celebració bianual que reviu el passat ibèric i romà de la vall.",
                        "content": "Se celebra bianualment per la primavera, entre maig i juny, amb motiu del ric rerefons històric de Cabrera de Mar. Durant aquesta festa, el poble es transforma per recrear la vida dels antics habitants de la vall. Els participants vesteixen vestimentes ibèriques i romanes i omplen els carrers d'activitats que evoquen el passat: demostracions d'oficis antics, representacions de cerimònies, mercats d'artesania, i recreacions de la vida quotidiana a Ilturo. La festa és una oportunitat única per connectar amb la història mil·lenària del municipi i posa en valor el patrimoni arqueològic de Cabrera de Mar, un dels més importants de Catalunya.",
                        "audio_transcript": "Un cop cada dos anys, Cabrera de Mar viatja al passat. Les tuniques romanes i les túniques ibèriques omplen els carrers, el so de les espases i els escuts ressona entre les cases, i el poble sencer celebra les seves arrels històriques.",
                    },
                },
            },
            # -- PATRIMONI NATURAL --
            {
                "slug": "parc-serralada-litoral",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Parc_de_la_Serralada_Litoral",
                "source_name": "Viquipèdia",
                "reading_time": 7,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "El Parc de la Serralada Litoral",
                        "summary": "Un espai natural protegit de 7.400 hectàrees que abraça Cabrera de Mar.",
                        "content": "El Parc de la Serralada Litoral és un espai d'interès natural que protegeix part de la Serralada de Marina, amb 7.400 hectàrees que abasten fins a 15 municipis, entre els quals Cabrera de Mar. El parc, creat el 2004 i coordinat per un consorci des de 1992, és un dels pulmons verds de l'àrea metropolitana de Barcelona. El seu relleu granític, amb turons com el Turó de Céllecs (534 m) o Sant Mateu (466 m), ofereix miradors espectaculars sobre la costa del Maresme. La vegetació combina alzinars litorals, pinedes de pi blanc, suredes i rouredes. La fauna inclou senglars, genetes, cabirols i 212 espècies d'ocells. El parc és un tresor de biodiversitat amb més de 1.000 espècies de plantes superiors.",
                        "audio_transcript": "Respireu profundament. Benvinguts al Parc de la Serralada Litoral. El cant dels ocells, el vent entre les branques dels pins i la vista del mar al fons us acompanyaran en aquesta ruta per un dels espais naturals més valuosos del Maresme.",
                    },
                },
            },
            {
                "slug": "font-picant-cabrera",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Font_Picant_de_Cabrera",
                "source_name": "Viquipèdia",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Font Picant de Cabrera",
                        "summary": "Un descobriment casual de 1859 que va donar lloc a un berenador històric al peu del castell.",
                        "content": "La Font Picant de Cabrera, coneguda també com Manantial Modolell, va ser descoberta casualment el 1859 al cor del Parc de la Serralada Litoral. La seva aigua gasosa natural i les seves propietats digestives van fer que es comencés a comercialitzar a partir de 1889, durant gairebé un segle. L'emblemàtica «Aigua de Cabrera» es venia a 2,85 pessetes el litre i es publicitava al diari La Vanguardia. L'entorn, amb grans eucaliptus i plataners, era un berenador molt freqüentat on les famílies hi anaven a passar el dia, amb barbacoes i servei de bar. Després d'anys d'abandó, el 2016 va reobrir les instal·lacions de restaurant. És el punt de partida ideal per a l'excursió al Castell de Burriac.",
                        "audio_transcript": "El soroll de l'aigua gasosa brollant de la roca us dona la benvinguda a la Font Picant. Durant generacions, les famílies de Cabrera han vingut aquí a berenar, a jugar i a gaudir de l'ombra dels eucaliptus centenaris.",
                    },
                },
            },
            {
                "slug": "ruta-castell-burriac",
                "historical_period": "Natural",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Ruta al Castell de Burriac",
                        "summary": "Una excursió imprescindible des de la Font Picant fins al Castell de Burriac.",
                        "content": "La ruta de senderisme des de la Font Picant al Castell de Burriac és una de les excursions més populars del Parc de la Serralada Litoral. Començant a la històrica font, el camí puja suaument entre alzines i pins, oferint vistes cada cop més àmplies de la costa del Maresme, des de Vilassar fins a Caldes d'Estrac. El recorregut d'aproximadament 2 km és apte per a tota la família. Al llarg del camí, es poden observar restes del Poblat Ibèric de Burriac, amb els seus murs i torres mil·lenàries entre la vegetació. Un cop al cim, a 392 metres d'altitud, el Castell de Burriac ofereix una vista panoràmica impressionant de tota la comarca. És recomanable portar aigua i calçat còmode, i gaudir de l'ombra dels pins.",
                        "audio_transcript": "Prepareu-vos per a una caminata inoblidable. El camí cap al Castell de Burriac serpenteja entre alzines i pins, amb la brisa del mar acompanyant-vos. Cada revolt del camí us regala una vista més espectacular de la costa.",
                    },
                },
            },
            {
                "slug": "fonts-cabrera",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Parc_de_la_Serralada_Litoral",
                "source_name": "Viquipèdia",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Les Fonts de Cabrera de Mar",
                        "summary": "Un recorregut per les fonts històriques que van abastir d'aigua el municipi durant segles.",
                        "content": "Cabrera de Mar compta amb un ric patrimoni de fonts naturals, moltes d'elles al Parc de la Serralada Litoral. La Font Picant de Cabrera és la més coneguda, però n'hi ha moltes d'altres que han estat refugi de famílies i punt de trobada durant generacions. La Font del Ferro, amb les seves aigües ferruginoses, era famosa per les seves propietats medicinals. La Font d'en Dirol, la Font dels Eucaliptus i la Font de Ca la Teresa són algunes de les moltes fonts que esquitxen els camins del parc. Tradicionalment, els diumenges era costum sortir a berenar a les fonts, una tradició coneguda com a fontades. Avui dia, algunes d'elles encara ragen i conviden a fer una aturada durant les excursions per la serralada.",
                        "audio_transcript": "L'aigua fresca de les fonts de Cabrera ha estat font de vida durant segles. Cada font té la seva història, la seva mina, els seus arbres singulars. Atureu-vos a beure i escolteu el murmuri de l'aigua.",
                    },
                },
            },
            {
                "slug": "platja-litoral-cabrera",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Platja i el Litoral de Cabrera de Mar",
                        "summary": "Un tram de costa tranquil entre Vilassar de Mar i Mataró, amb platges de sorra fina.",
                        "content": "Tot i que el nucli urbà de Cabrera de Mar es troba a 2,5 km de la costa, el municipi disposa d'un front litoral de platges de sorra que són continuació de la platja de Vilassar de Mar. Els nuclis costaners del Pla de l'Avellà, Costamar i Bonamar concentren l'activitat de platja, amb un ambient tranquil i familiar. Les platges de Cabrera, menys massificades que les dels municipis veïns, ofereixen un espai de relax on el soroll de les onades i la brisa marina conviden al descans. El sistema de dunes i la vegetació litoral configuren un ecosistema d'interès que connecta la serralada amb el mar Mediterrani. És una zona ideal per passejar, practicar esports nàutics o gaudir de la posta de sol.",
                        "audio_transcript": "Les ones acariciant la sorra, el sol pausant-se sobre el mar. La platja de Cabrera de Mar ofereix un refugi de calma on el temps s'atura i la brisa marina us convida a somiar.",
                    },
                },
            },
            # -- PATRIMONI MODERNISTA I CONTEMPORANI --
            {
                "slug": "can-cata-modernista",
                "historical_period": "Modern",
                "source_url": "https://patrimoni.gencat.cat/",
                "source_name": "Patrimoni Gencat - Generalitat de Catalunya",
                "reading_time": 4,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Can Catà: El Modernisme a Cabrera",
                        "summary": "Un destacat edifici modernista que testimonia el pas de la burgesia Barcelonina per Cabrera.",
                        "content": "Can Catà és un dels exemples més notables de l'arquitectura modernista a Cabrera de Mar. Construït com a torre d'estiueig per a una família de la burgesia barcelonina, l'edifici combina elements típics del modernisme: formes orgàniques inspirades en la natura, ferro forjat en baranes i balcons, vidrieres de colors que filtren la llum, i ceràmica policromada decorativa. La torre, envoltada d'un jardí amb espècies mediterrànies, forma part del conjunt de cases d'estiueig que van transformar el poble a finals del segle XIX i principis del XX. Els seus elements arquitectònics singulars la converteixen en un dels edificis més fotografiats de Cabrera de Mar.",
                        "audio_transcript": "Davant la façana de Can Catà, admireu la bellesa del modernisme català. La pedra, el ferro i el vidre es combinen en una dansa de formes orgàniques que capturen l'esperit d'una època d'optimisme i creativitat.",
                    },
                },
            },
            {
                "slug": "ferrocarril-arribada-cabrera",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "L'Arribada del Ferrocarril al Maresme",
                        "summary": "Com el tren va connectar Cabrera de Mar amb Barcelona i va transformar el poble.",
                        "content": "L'arribada del ferrocarril al Maresme a mitjans del segle XIX va ser un punt d'inflexió per a Cabrera de Mar. La línia de Barcelona a Mataró, inaugurada el 1848 com la primera línia de ferrocarril de la península, va connectar la comarca amb la capital. Tot i que Cabrera de Mar no tenia estació pròpia, les estacions properes de Vilassar de Mar i Mataró van facilitar l'arribada de la burgesia barcelonina que va impulsar la construcció de les torres modernistes. El ferrocarril va permetre també la sortida dels productes agrícoles, especialment vi i flors, cap als mercats de Barcelona. Aquesta connexió va transformar l'economia local i va obrir Cabrera de Mar al món, convertint-la en una destinació residencial i turística.",
                        "audio_transcript": "El xiulet del tren ressonant per la costa va canviar Cabrera per sempre. Amb ell van arribar nous visitants, noves idees i una nova era de prosperitat.",
                    },
                },
            },
            # -- PATRIMONI INMATERIAL --
            {
                "slug": "tradicio-vinicola-maresme",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "La Tradició Vinícola del Maresme",
                        "summary": "Segles de cultura del vi a les valls del Maresme, des dels romans fins a l'actualitat.",
                        "content": "La tradició vinícola del Maresme es remunta a l'època romana, quan les valls de Cabrera de Mar ja produïen vi que s'exportava per tot el Mediterrani. Les àmfores trobades al taller de Can Portell i a la factoria de Ca l'Arnau són testimoni d'aquesta activitat mil·lenària. Durant l'edat mitjana, els monjos i les masies van mantenir la tradició, i al segle XIX la vinya va viure una edat d'or abans de la fil·loxera. Tot i que la plaga va devastar les vinyes, la tradició ha perdurat en cellers artesanals que elaboren vins de qualitat amb varietats autòctones com la garnatxa i el pansa blanca. En l'actualitat, la DO Alella, que inclou Cabrera de Mar, produeix vins reconeguts internacionalment.",
                        "audio_transcript": "El raïm ha estat part fonamental de la vida de Cabrera durant dos mil anys. El vi que brolla d'aquestes terres explica la història d'un poble que ha sabut mantenir viva la tradició vinícola generació rere generació.",
                    },
                },
            },
            {
                "slug": "gastronomia-local-cabrera",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Gastronomia Tradicional de Cabrera de Mar",
                        "summary": "Els sabors autèntics del Maresme: productes de l'horta i del mar.",
                        "content": "La gastronomia de Cabrera de Mar reflecteix la seva condició de poble entre la serra i el mar. Els plats tradicionals combinen els productes de l'horta amb els del Mediterrani. L'escudella i carn d'olla és el plat d'hivern per excel·lència. Suquet de peix, arròs caldós i fideuà són protagonistes a taula durant tot l'any. Les verdures del Maresme, especialment les carxofes, pèsols i faves, són la base de plats tradicionals com les carxofes a la brasa i els pèsols amb pernil. El pa de pagès, els embotits artesanals i els formatges locals completen l'oferta. La pastisseria tradicional inclou la coca de llardons, els carquinyolis i els panellets per Tots Sants. Tot regat amb un bon vi de la DO Alella.",
                        "audio_transcript": "Els sabors de Cabrera us parlaran de la seva gent. El peix acabat de pescar, les verdures de l'horta, el vi dels cellers del Maresme, tot convida a seure i gaudir dels plaers de la taula.",
                    },
                },
            },
            # =====================================================================
            # NEW STORIES — Expanded seed with 22+ new stories
            # =====================================================================
            # -- PREHISTORIC --
            {
                "slug": "primers-pobladors-prehistorics",
                "historical_period": "Prehistoric",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Els Primers Pobladors Prehistòrics de Cabrera de Mar",
                        "summary": "Restes neolítiques i megalítiques testimonien la presència humana a la vall des de fa milers d'anys.",
                        "content": "Abans dels ibers i dels romans, el territori de Cabrera de Mar ja estava habitat. Les prospeccions arqueològiques han localitzat restes neolítiques a diversos punts del municipi, especialment a les zones elevades de la Serralada Litoral. S'hi han trobat fragments de ceràmica decorada, destrals de pedra polida i restes de sílex que indiquen una presència humana durant el Neolític i el Calcolític. Les condicions geogràfiques de la vall, amb aigua abundant, boscos densos i proximitat al mar, la feien un lloc ideal per als primers assentaments humans. Malgrat que no s'han descobert grans estructures megalítiques dins del terme municipal, la presència de dòlmens i menhirs als municipis veïns de la Serralada Litoral suggereix que aquesta àrea va ser un paisatge sagrat i habitat des de la prehistòria recent.",
                        "audio_transcript": "Milers d'anys abans que Ilturo fos construïda, els primers humans ja habitaven aquestes valls. Amb eines de pedra i ceràmica senzilla, van aprofitar la riquesa de la terra i el mar per establir els primers assentaments de la zona.",
                    },
                },
            },
            # -- ROMAN --
            {
                "slug": "taller-amfores-can-portell",
                "historical_period": "Roman",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "hard",
                "translations": {
                    "ca": {
                        "title": "El Taller d'Àmfores de Can Portell",
                        "summary": "Un important centre de producció amfòrica romana a la vall de Cabrera.",
                        "content": "El jaciment de Can Portell, situat a la vall de Cabrera de Mar, acull les restes d'un important taller de producció d'àmfores d'època romana. Aquest taller, actiu entre els segles I aC i I dC, estava dedicat a la fabricació de contenidors ceràmics per al transport i l'emmagatzematge de vi i oli, els principals productes d'exportació de la zona. Les excavacions han documentat diversos forns de planta circular i rectangular, així com grans dipòsits d'argila i àrees de treball. Les àmfores produïdes a Can Portell portaven segells que les identificaven, i se n'han trobat exemplars en jaciments de tot el Mediterrani occidental. Aquesta troballa demostra la integració de la vall de Cabrera en les xarxes comercials de l'Imperi Romà i la importància de la producció agrícola local.",
                        "audio_transcript": "En aquest punt de la vall, fa dos mil anys, els artesans romans modelaven l'argila per crear les àmfores que transportarien el vi de Cabrera a tot el Mediterrani. El foc dels forns cremava dia i nit, i el fum s'enlairava senyalant un dels centres productors més importants de la comarca.",
                    },
                },
            },
            {
                "slug": "aqeducte-infraestructures-romanes",
                "historical_period": "Roman",
                "source_url": "https://www.museudecabrerademar.cat/",
                "source_name": "Museu de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Infraestructures Hidràuliques Romanes",
                        "summary": "Aqüeductes, clavegueres i canals que demostren l'enginyeria romana a Cabrera.",
                        "content": "Les excavacions als jaciments romans de Cabrera de Mar han posat al descobert un impressionant sistema d'infraestructures hidràuliques que demostra l'alt nivell d'enginyeria dels romans. Al nucli urbà de Ca l'Arnau s'han documentat clavegueres, canalitzacions d'aigua potable i sistemes de drenatge que servien les termes públiques i les cases. Les restes d'aqüeductes i mines d'aigua, que portaven l'aigua des de les fonts de la serralada fins al nucli urbà, mostren un coneixement avançat de la hidràulica. Les termes, amb els seus hipocausts (sistemes de calefacció per terra radiant), requerien un subministrament constant d'aigua i llenya. Aquestes infraestructures van servir durant segles i algunes van ser reutilitzades en època medieval i moderna.",
                        "audio_transcript": "Sota els vostres peus, les canalitzacions romanes encara testimonien la mestria dels enginyers antics. L'aigua que baixava de la muntanya alimentava les termes, les cases i les fonts públiques d'una ciutat que mirava cap al mar.",
                    },
                },
            },
            # -- IBERIAN --
            {
                "slug": "cadira-del-bisbe-ilturo",
                "historical_period": "Iberian",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 6,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "La Cadira del Bisbe: Cor d'Ilturo",
                        "summary": "El turó fortificat que va ser el centre ceremonial i polític de la capital laietana.",
                        "content": "La Cadira del Bisbe, coneguda també com a Turó de l'Infern, és el punt culminant del poblat ibèric d'Ilturo. Des d'aquest turó, els laietans controlaven visualment tota la vall de Cabrera i la costa del Maresme. Les excavacions hi han revelat estructures singulares que suggereixen que era un espai ceremonial i de poder, on els caps de la tribu prenien decisions polítiques i religioses. El nom popular de «Cadira del Bisbe» fa referència a una formació rocosa que recorda una cadira, associada per la tradició oral a la seu d'autoritat. El poblat s'estenia pels vessants del turó, amb cases de pedra i carrers empedrats, protegit per una muralla de grans blocs ciclopis que encara es conserva en alguns trams. Ilturo va ser destruït al voltant de l'any 197 aC després de la revolta dels laietans contra l'ocupació romana.",
                        "audio_transcript": "Des de la Cadira del Bisbe, tot el Maresme s'estén als vostres peus. Aquí, els cabdills laietans contemplaven el seu territori, des del mar fins a les muntanyes de l'interior. Un paisatge de poder mil·lenari.",
                    },
                },
            },
            # -- MEDIEVAL --
            {
                "slug": "ermita-sant-crist",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "L'Ermita de Sant Crist",
                        "summary": "Una petita ermita d'origen medieval enclavada al paisatge de la Serralada Litoral.",
                        "content": "L'Ermita de Sant Crist és una petita capella rural situada al terme municipal de Cabrera de Mar, dins l'entorn del Parc de la Serralada Litoral. D'origen medieval, l'ermita ha estat objecte de diverses reformes al llarg dels segles. Tradicionalment, era un lloc de devoció i de pelegrinatge per als pagesos de les masies dels voltants, que hi acudien en processó per demanar protecció per a les collites i beneir els camps. El seu entorn, envoltat de boscos d'alzines i pins, la converteix en una destinació tranquil·la per a les excursions a peu pels senders del parc. Les parets de pedra vista i la senzillesa de la seva arquitectura popular contrasten amb la grandiositat del paisatge que l'envolta.",
                        "audio_transcript": "Enmig del bosc, l'Ermita de Sant Crist emergeix com un refugi de pau i espiritualitat. Durant segles, els pagesos de Cabrera hi van venir a resar i a cercar consol. El silenci del bosc acompanya aquest petit santuari.",
                    },
                },
            },
            {
                "slug": "torre-defensa-costera-cabrera",
                "historical_period": "Medieval",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Torres de Defensa Costera del Maresme",
                        "summary": "Torres de guaita que protegien la costa de Cabrera de Mar dels atacs pirates.",
                        "content": "La costa del Maresme va patir durant segles els constants atacs de pirates barbarescos i corsaris. Per defensar-se, es va construir una xarxa de torres de guaita i defensa al llarg de tot el litoral. Cabrera de Mar, tot i no tenir una torre costanera dins del seu terme, es beneficiava de les torres dels municipis veïns i del systema de senyals del Castell de Burriac. Les masies fortificades com Can Feliu, amb la seva torre de defensa, servien de refugi per a la població en cas de perill. Aquestes torres, connectades visualment entre si, permetien transmetre alertes ràpidament al llarg de la costa. L'activitat pirata al Maresme va ser especialment intensa entre els segles XVI i XVIII, i va condicionar l'arquitectura i l'urbanisme de la zona.",
                        "audio_transcript": "Imagineu les nits de vigilància a la costa. Els guardes guaitaven l'horitzó buscant veles pirates, preparats per encendre les fogueres d'alerta que protegirien la població. Una xarxa de torres i miradors defensava aquesta terra dels atacs per mar.",
                    },
                },
            },
            {
                "slug": "can-feliu-masia-torre-defensa",
                "historical_period": "Medieval",
                "source_url": "https://patrimoni.gencat.cat/",
                "source_name": "Patrimoni Gencat - Generalitat de Catalunya",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Can Feliu: Masia i Torre de Defensa",
                        "summary": "Una masia fortificada amb torre de defensa que testimonia la vida rural medieval.",
                        "content": "Can Feliu és una de les masies històriques més emblemàtiques de Cabrera de Mar. D'origen medieval, l'edifici combina l'arquitectura residencial amb una imponent torre de defensa quadrada que servia per protegir els habitants de la masia dels atacs de pirates i bandolers. La torre, amb espitlleres i matacans, s'alça sobre el cos principal de l'edifici i ofereix una vista panoràmica de la vall. Al seu interior, es conserven elements arquitectònics originals com ara paviments de pedra, voltes de canó i una premsa de vi tradicional. La masia va estar habitada per la nissaga dels Feliu durant generacions, dedicada al cultiu de la vinya i dels cereals. Forma part de l'Inventari del Patrimoni Arquitectònic Català.",
                        "audio_transcript": "Al cor de la vall, la masia de Can Feliu guarda la memòria d'una pagesia que va defensar la seva terra durant segles. La torre que l'acompanya és el testimoni d'un temps en què la vida rural requeria protecció contra els perills que arribaven del mar.",
                    },
                },
            },
            {
                "slug": "can-dalmases-masia",
                "historical_period": "Medieval",
                "source_url": "https://patrimoni.gencat.cat/",
                "source_name": "Patrimoni Gencat - Generalitat de Catalunya",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Can Dalmases (Cal Conde): Masia Senyorial",
                        "summary": "Una masia de propietat municipal amb elements arquitectònics dels segles XVII i XVIII.",
                        "content": "Can Dalmases, coneguda popularment com Cal Conde, és una masia senyorial situada al nucli urbà de Cabrera de Mar. L'edifici, que data dels segles XVII i XVIII, presenta una arquitectura popular catalana amb elements nobles com un portal adovellat, finestres amb llindes decorades i un barri tancat. La masia va ser la residència d'una família de pagès benestant que posseïa grans extensions de terra dedicades a la vinya i l'olivera. Actualment, Can Dalmases és de propietat municipal i s'utilitza per a activitats culturals i socials del poble. La masia és un exemple de la transició de l'arquitectura medieval a la modernitat, amb les seves parets encalades i el seu jardí interior que convida a la tranquil·litat.",
                        "audio_transcript": "Al centre del poble, Can Dalmases ens parla d'una època de prosperitat pagesa. La seva façana senyorial i el seu portal adovellat ens traslladen als segles XVII i XVIII, quan les masies eren el cor de la vida econòmica del municipi.",
                    },
                },
            },
            # -- LEGENDS --
            {
                "slug": "llegenda-pou-torre-burriac",
                "historical_period": "Legend",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 3,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Llegenda del Pou de la Torre de Burriac",
                        "summary": "Un pou sense fons al castell de Burriac que amaga tresors i misteris.",
                        "content": "Explica una antiga llegenda popular que al Castell de Burriac hi ha un pou que no té fons. Es deia que aquest pou arribava fins al mar, a centenars de metres per sota de la muntanya. Els antics habitants del castell hi llançaven monedes d'or i objectes de valor per amagar-los dels invasors. Els pastors de la zona asseguraven que algunes nits de lluna plena es podien sentir sorolls estranys que venien de les profunditats del pou, com si els esperits dels antics senyors del castell custodíssin el tresor. La llegenda adverteix que aquell que s'atreveixi a mirar dins del pou en una nit de tempesta veurà reflectida la seva pròpia ànima i quedarà lligat per sempre a la muntanya de Burriac.",
                        "audio_transcript": "Prop de les ruïnes del castell, un pou profund guarda secrets mil·lenaris. La llegenda diu que connecta amb el mar i que les nits de tempesta s'hi escolten veus de l'altre món. No us hi apropeu massa, la muntanya de Burriac protegeix els seus misteris.",
                    },
                },
            },
            {
                "slug": "llegenda-dona-aigua-cabrera",
                "historical_period": "Legend",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar — Tradició oral",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Llegenda de la Dona d'Aigua de Cabrera",
                        "summary": "Un esperit femení de les fonts que protegeix les rieres i els boscos de Cabrera.",
                        "content": "La Dona d'Aigua és una figura recurrent de la mitologia catalana, i Cabrera de Mar té la seva pròpia versió de la llegenda. Es deia que a les fonts més amagades del Parc de la Serralada Litoral, especialment a la Font del Ferro i a la riera de Cabrera, hi habitava una dona misteriosa de llarga cabellera que apareixia als viatgers. Segons la tradició oral transmesa entre els pagesos de les masies, la Dona d'Aigua protegia les fonts i els rierols, i castigava aquells que contaminaven l'aigua. Però a les persones de bon cor, oferia tres desitjos a canvi de silenci. La llegenda servia per recordar als nens i joves la importància de cuidar l'aigua i el bosc, recursos essencials per a la supervivència de la comunitat rural.",
                        "audio_transcript": "Escolteu el murmuri de l'aigua entre les roques de la font. Segons la tradició, la Dona d'Aigua de Cabrera us observa des de l'ombra dels arbres, protectora dels rierols i custòdia dels secrets del bosc. Respecteu l'aigua, i ella us serà favorable.",
                    },
                },
            },
            # -- MODERN --
            {
                "slug": "oficis-tradicionals-cabrera",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Els Oficis Tradicionals de Cabrera de Mar",
                        "summary": "Pagesos, pescadors, teixidors i artesans que van sostenir l'economia local durant segles.",
                        "content": "Abans de la industrialització, Cabrera de Mar era una comunitat rural on els oficis tradicionals marcaven el ritme de la vida. La pagesia era l'activitat principal, amb el cultiu de la vinya, l'olivera i els cereals. Moltes masies tenien les seves pròpies premses de vi i d'oli. Els pescadors del litoral aprofitaven la proximitat del mar per completar la dieta i l'economia familiar. Hi havia també artesans del cànem i el lli, que treballaven les fibres tèxtils; carboners que explotaven els boscos de la Serralada Litoral; i teulers que fabricaven teules i maons amb l'argila local. Els traginers transportaven els productes fins als mercats de Barcelona i Mataró. Aquests oficis, avui desapareguts en la seva majoria, configuren la memòria col·lectiva del poble.",
                        "audio_transcript": "El record dels oficis antics de Cabrera perviu en les eines conservades a les masies i en la memòria dels més grans. Pagesos, carboners i artesans van modelar el paisatge i la cultura d'aquest poble durant generacions.",
                    },
                },
            },
            {
                "slug": "desenvolupament-urbanistic-segle-xx",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "El Desenvolupament Urbanístic de Cabrera al Segle XX",
                        "summary": "De poble agrícola a municipi residencial: la transformació de Cabrera de Mar al llarg del segle XX.",
                        "content": "Al llarg del segle XX, Cabrera de Mar va experimentar una transformació urbanística profunda que va canviar la seva fesomia. Durant les primeres dècades, el poble va mantenir el seu caràcter agrícola, amb masies disseminades i un petit nucli urbà al voltant de l'església de Sant Feliu. La guerra civil (1936-1939) va deixar la seva empremta, amb la destrucció parcial de l'església i diverses masies. A partir dels anys seixanta, la pressió urbanística va créixer amb la construcció de nous barris com el Pla de l'Avellà i Costamar, que van atraure residents de Barcelona buscant segones residències. A finals del segle XX i principis del XXI, el poble va consolidar-se com a municipi residencial, amb un creixement ordenat que ha procurat preservar el patrimoni històric i l'entorn natural. L'aprovació del POUM al 2009 va establir les bases per a un desenvolupament sostenible.",
                        "audio_transcript": "El Cabrera de Mar que coneixeu avui és el resultat d'una llarga evolució. De poble de pagesos a refugi d'estiuejants, i finalment a municipi residencial que ha sabut mantenir el seu encant tradicional.",
                    },
                },
            },
            {
                "slug": "pagesia-vida-rural",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 5,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "La Pagesia i la Vida Rural a Cabrera de Mar",
                        "summary": "Segles de treball de la terra que han modelat el paisatge i la identitat del poble.",
                        "content": "La pagesia ha estat el motor econòmic i social de Cabrera de Mar durant més de mil anys. Les masies, disseminades per tota la vall, eren unitats d'explotació agrària autosuficients que conreaven vinya, oliveres, cereals i hortalisses. Cada masia tenia els seus camps, el seu bosc, la seva font i el seu bestiar. La vida dels pagesos seguia el ritme de les estacions: la verema a finals d'estiu, la recollida de l'oliva a l'hivern, la sembra dels cereals a la primavera. Les relacions entre masies eren de cooperació i intercanvi. La transmissió de coneixements agrícoles de pares a fills va mantenir viva una tradició que, tot i la davallada del sector primari al segle XX, ha deixat una empremta indeleble en el paisatge de Cabrera de Mar. Actualment, algunes masies han diversificat la seva activitat amb l'agroturisme.",
                        "audio_transcript": "La terra de Cabrera ha estat treballada amb esforç i dedicació durant generacions. Les masies que esquitxen la vall parlen d'una vida senzilla, lligada al cicle de les estacions, on cada collita era una celebració.",
                    },
                },
            },
            {
                "slug": "processons-tradicions-religioses",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Les Processons i Tradicions Religioses a Cabrera",
                        "summary": "El calendari litúrgic ha marcat la vida comunitària de Cabrera durant segles.",
                        "content": "Com molts pobles catalans, Cabrera de Mar celebrava un seguit de tradicions religioses que marcaven el calendari anual i reforçaven els vincles comunitaris. La processó de Sant Feliu, l'1 d'agost, és la més important, però n'hi havia moltes d'altres. Per Setmana Santa, les processons del silenci recorrien els carrers del poble, amb els veïns participant en la representació dels misteris. La benedicció dels termes i dels vehicles el dia de Sant Antoni Abat, el 17 de gener, era una de les festes més arrelades. El Diumenge de Rams, la processó fins a l'església amb palmes i rams d'olivera donava inici a la Setmana Santa. La tradició de les caramelles, cantades pels grups de joves durant la Pasqua, omplia els carrers de música i alegria. Moltes d'aquestes tradicions, tot i que amb menys intensitat, es mantenen vives gràcies a l'esforç de les associacions locals.",
                        "audio_transcript": "El so de les campanes de Sant Feliu ha acompanyat les processons i celebracions de Cabrera durant segles. Cada tradició, cada festa religiosa, era una ocasió per a la comunitat de reunir-se i compartir.",
                    },
                },
            },
            {
                "slug": "conreu-flor-tallada-maresme",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Maresme",
                "source_name": "Viquipèdia del Maresme",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "El Conreu de la Flor Tallada al Maresme",
                        "summary": "Una tradició agrícola que va convertir el Maresme en el gran jardí de Barcelona.",
                        "content": "El conreu de la flor tallada és una de les senyes d'identitat agrícola del Maresme. Des de finals del segle XIX, les valls costaneres, incloent la de Cabrera de Mar, es van especialitzar en el cultiu de clavells, roses i gladiols que es destinaven als mercats de Barcelona i Europa. Les condicions climàtiques suaus i la proximitat al mercat consumidor van afavorir aquesta especialització. Durant bona part del segle XX, els hivernacles de flors van cobrir el paisatge del Maresme, generant una important activitat econòmica i donant feina a moltes famílies. Tot i la davallada del sector per la competència de països com Holanda i Colòmbia, el conreu de la flor tallada manté una presència significativa i forma part de la identitat cultural de la comarca.",
                        "audio_transcript": "Els colors i les fragàncies de les flors del Maresme han omplert els mercats de Barcelona durant generacions. Els hivernacles que cobreixen les valls són el testimoniatge d'una tradició que ha portat la bellesa de la comarca a tot el món.",
                    },
                },
            },
            # -- NATURAL --
            {
                "slug": "rieres-cabrera-mar",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Cabrera_de_Mar",
                "source_name": "Viquipèdia de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Les Rieres de Cabrera de Mar",
                        "summary": "Els cursos d'aigua que baixen de la Serralada Litoral cap al mar i modelen la vall.",
                        "content": "Cabrera de Mar està travessat per diverses rieres i torrents que baixen de la Serralada Litoral cap al mar Mediterrani. La riera de Cabrera és la més important, recollint les aigües de la vall principal i desembocant prop de la platja. Aquests cursos d'aigua, de caràcter mediterrani, porten aigua de manera torrencial durant les pluges de primavera i tardor, però queden secs durant els mesos d'estiu. Les rieres han modelat el paisatge de la vall durant milers d'anys, creant un terreny fèrtil on s'han assentat els cultius des de l'època dels ibers. Tot i que avui dia algunes estan canalitzades o cobertes al seu pas pel nucli urbà, les rieres són un element fonamental de la geografia local, que aporten biodiversitat i frescor a la plana.",
                        "audio_transcript": "El so de l'aigua baixant per la riera després de la pluja és un dels records més antics de Cabrera. Aquests cursos d'aigua, que moren al mar, han donat vida a la vall durant milers d'anys i han estat testimonis de tota la història del poble.",
                    },
                },
            },
            {
                "slug": "flora-fauna-serralada-litoral",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Parc_de_la_Serralada_Litoral",
                "source_name": "Viquipèdia",
                "reading_time": 6,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "La Flora i la Fauna del Parc de la Serralada Litoral",
                        "summary": "Un refugi de biodiversitat mediterrània al cor del Maresme, al costat de Cabrera de Mar.",
                        "content": "El Parc de la Serralada Litoral, que abraça part del terme de Cabrera de Mar, és un veritable tresor de biodiversitat mediterrània. La vegetació dominant és l'alzinar litoral, amb alzines sureres, pins blancs i pins pinyoners, acompanyats d'un sotabosc ric en arbustos com l'arboç, el marfull i el llentiscle. A les zones més fresques i obagues creixen roures i aurons, mentre que a les parts altes, més exposades al vent, domina la brolla de romaní i estepa. La fauna del parc inclou mamífers com el senglar, la geneta, el cabirol, el teixó i la guineu. Les aus rapinyaires com l'àliga marcenca, l'astor i el falcó pelegrí nidifiquen als cingles. Segons els estudis, al parc s'hi han catalogat més de 212 espècies d'ocells i 1.000 espècies de plantes superiors. Aquesta riquesa fa del parc un destí privilegiat per a naturalistes i excursionistes.",
                        "audio_transcript": "Camineu en silenci pel Parc de la Serralada Litoral i descobrireu un món de vida. Els cants dels ocells, el moviment furtiu d'un cabirol entre els arbres, l'olor de les herbes aromàtiques. La natura us convida a explorar els seus secrets.",
                    },
                },
            },
            {
                "slug": "geologia-serralada-litoral",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Parc_de_la_Serralada_Litoral",
                "source_name": "Viquipèdia",
                "reading_time": 5,
                "difficulty": "hard",
                "translations": {
                    "ca": {
                        "title": "La Geologia de la Serralada Litoral",
                        "summary": "Les roques granítiques que formen el substrat de Cabrera de Mar i el seu entorn natural.",
                        "content": "La Serralada Litoral, on s'insereix Cabrera de Mar, està formada principalment per roques granítiques i granodiorítiques del període Carbonífer-Permià, fa uns 300 milions d'anys. Aquests granits van emergir durant l'orogènia varisca i posteriorment van ser modelats per l'erosió durant milions d'anys. El relleu actual es caracteritza per turons arrodonits de poca alçada, amb formacions rocalloses singulars com les que donen nom a la Cadira del Bisbe. Les rieres han excavat valls estretes on afloren materials sedimentaris més recents propers a la costa. La pedra granítica ha estat explotada històricament a la zona com a material de construcció, i es pot observar en nombrosos edificis antics de Cabrera de Mar. Del punt de vista geològic, aquesta zona forma part del bloc catalanídic, una de les unitats geològiques fonamentals de Catalunya.",
                        "audio_transcript": "Les roques que trepitgeu a Cabrera de Mar tenen 300 milions d'anys. El granit que forma la Serralada Litoral ha estat modelat pel vent i l'aigua durant milers de segles, creant un paisatge únic de turons suaus i formacions rocalloses singulars.",
                    },
                },
            },
            {
                "slug": "clima-medi-natural-maresme",
                "historical_period": "Natural",
                "source_url": "https://ca.wikipedia.org/wiki/Maresme",
                "source_name": "Viquipèdia del Maresme",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "El Clima i el Medi Natural del Maresme",
                        "summary": "Un clima mediterrani suau que ha definit la vida i el paisatge de Cabrera de Mar.",
                        "content": "El clima de Cabrera de Mar és típicament mediterrani litoral, amb hiverns suaus i estius càlids, però temperats per la brisa marina. La temperatura mitjana anual ronda els 16 °C, amb màximes estivals que poques vegades superen els 30 °C i mínimes hivernals que rarament baixen dels 5 °C. Les precipitacions, al voltant dels 600 mm anuals, es concentren a la primavera i la tardor, sovint en forma de pluges torrencials típiques del clima mediterrani. La tramuntana i el garbí són els vents predominants. Aquest clima suau ha afavorit l'ocupació humana des de la prehistòria i ha permès una agricultura diversa, especialment el conreu de la vinya, l'olivera i la flor tallada. La combinació del clima, el relleu i la proximitat al mar ha creat un ecosistema de gran riquesa que defineix l'entorn natural de la comarca.",
                        "audio_transcript": "La brisa suau del Mediterrani, el sol càlid, les pluges de tardor que omplen les rieres. El clima de Cabrera de Mar ha estat el millor aliat dels seus habitants des de temps immemorials: un clima que convida a viure a l'aire lliure.",
                    },
                },
            },
            {
                "slug": "sardanes-cabrera-mar",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Les Sardanes a Cabrera de Mar",
                        "summary": "La dansa nacional catalana ha tingut una presència destacada a les festes i places de Cabrera.",
                        "content": "La sardana, la dansa nacional de Catalunya, ha format part de la vida social de Cabrera de Mar durant el segle XX i fins a l'actualitat. Les ballades de sardanes a la plaça de l'església i a la plaça del poble eren un dels actes centrals de la Festa Major i d'altres celebracions locals. La Cobla de Cabrera o les cobles convidades omplien de música el centre del poble, i veïns de totes les edats s'incorporaven als cercles de la dansa. Tradicionalment, les sardanes s'han ballat a Cabrera el primer diumenge de maig, durant la Festa de la Sardana, i també durant la Festa Major d'agost. Tot i que la popularitat de la sardana ha disminuït en les darreres dècades, el poble manté viva la tradició amb ballades periòdiques i cursos d'aprenentatge a l'escola de música local.",
                        "audio_transcript": "La música de la cobla omple la plaça de Cabrera. Els cercles de la sardana s'obren, mans enlaire, punts dansaires que uneixen la gent en una rotllana d'alegria i tradició. Així ballen els cabrerencs des de fa generacions.",
                    },
                },
            },
            {
                "slug": "aplec-cabrera-mar",
                "historical_period": "Modern",
                "source_url": "https://www.cabrerademar.cat/",
                "source_name": "Ajuntament de Cabrera de Mar",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "L'Aplec de Cabrera de Mar",
                        "summary": "Una trobada popular al cor de la natura que celebra la primavera i la comunitat.",
                        "content": "L'Aplec és una de les celebracions tradicionals més estimades de Cabrera de Mar. Se celebra anualment a la primavera, normalment al maig, en un entorn natural del municipi com la Font Picant o els voltants del Castell de Burriac. Durant l'Aplec, les famílies de Cabrera surten al camp per passar el dia, compartint menjar, música i jocs tradicionals. La jornada inclou missa de campanya, ballada de sardanes, concerts d'havaneres, jocs infantils i, sovint, una arrossada popular. L'Aplec és una ocasió per retrobar-se amb amics i veïns, per gaudir de la natura i per mantenir vives les tradicions populars catalanes. Aquesta celebració reforça els llaços comunitaris i connecta els cabrerencs amb el seu entorn natural i el seu patrimoni cultural.",
                        "audio_transcript": "El so de la tenora i les havaneres ressona entre els pins de la Font Picant. Famílies senceres comparteixen taula, música i rialles en l'Aplec, una diada que celebra la primavera i la germanor entre els cabrerencs.",
                    },
                },
            },
            {
                "slug": "masia-can-roure-bruguera",
                "historical_period": "Medieval",
                "source_url": "https://patrimoni.gencat.cat/",
                "source_name": "Patrimoni Gencat - Generalitat de Catalunya",
                "reading_time": 4,
                "difficulty": "easy",
                "translations": {
                    "ca": {
                        "title": "Can Roure i Can Bruguera: Masies de la Vall",
                        "summary": "Dues masies històriques que completen el ric mosaic de patrimoni rural de Cabrera.",
                        "content": "Can Roure i Can Bruguera són dues masies que formen part del valuós conjunt de patrimoni rural de Cabrera de Mar. Can Roure, situada als contraforts de la Serralada Litoral, és una masia d'origen medieval que conserva elements arquitectònics originals com portals de pedra, finestres amb llindes i una àmplia era de batre. Can Bruguera, propera al nucli urbà, presenta una estructura clàssica de masia catalana amb cos principal, barri i dependències agrícoles. Ambdues masies estan envoltades de camps de conreu que durant segles han produït vi, cereals i oli. Tot i que actualment ja no estan dedicades a l'activitat agrícola tradicional, les dues masies es conserven com a testimonis silenciosos de la vida rural de la vall i estan incloses en l'Inventari del Patrimoni Arquitectònic Català.",
                        "audio_transcript": "Les masies de Can Roure i Can Bruguera, encaixades entre els camps i el bosc, expliquen la història d'una pagesia que va saber viure en harmonia amb la natura. Cada pedra, cada finestra, cada era parla d'un temps de treball i senzillesa.",
                    },
                },
            },
            {
                "slug": "pedreres-burriac-pedra-cabrera",
                "historical_period": "Modern",
                "source_url": "https://ca.wikipedia.org/wiki/Castell_de_Burriac",
                "source_name": "Viquipèdia",
                "reading_time": 4,
                "difficulty": "medium",
                "translations": {
                    "ca": {
                        "title": "Les Pedreres de Burriac: La Pedra de Cabrera",
                        "summary": "La pedra granítica de Burriac, explotada durant segles per a la construcció del poble.",
                        "content": "La muntanya de Burriac no només és coneguda pel seu castell medieval i els jaciments ibèrics i romans, sinó també per la pedra granítica que n'ha estat extreta durant segles. Les pedreres de Burriac van proporcionar material de construcció per a moltes cases, masies i murs de Cabrera de Mar i altres poblacions del Maresme. La pedra granítica, resistent i abundant, era ideal per a fonaments, murs de càrrega i elements arquitectònics com llindes i portals. Aquesta activitat extractiva, que va ser especialment intensa durant els segles XIX i XX, ha deixat marques visibles al paisatge del vessant del turó. Les pedreres abandonades s'han integrat ara a la vegetació del Parc de la Serralada Litoral, formant part del patrimoni industrial i paisatgístic de Cabrera de Mar.",
                        "audio_transcript": "Les pedres que formen les cases més antigues de Cabrera van sortir d'aquestes pedreres de Burriac. Durant generacions, els picapedrers van arrancar el granit de la muntanya per construir el poble. Una memòria de pedra que perviu en cada racó del municipi.",
                    },
                },
            },
        ]

        with transaction.atomic():
            root_category, created = Category.objects.get_or_create(
                slug="storytelling",
                defaults={
                    "nombre": "Storytelling",
                    "descripcion": "Historias y leyendas de Cabrera de Mar",
                    "taxonomy": "story_type",
                    "is_published": True,
                },
            )
            if root_category.taxonomy != "story_type":
                root_category.taxonomy = "story_type"
                root_category.save()

            singleton, _ = StoryCategorySingleton.objects.get_or_create(
                pk=1, defaults={"category": root_category}
            )
            if singleton.category != root_category:
                singleton.category = root_category
                singleton.save()

            count = Story.objects.count()
            Story.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f"Removed {count} existing stories."))

            for data in stories_data:
                story = Story.objects.create(
                    slug=data["slug"],
                    historical_period=data["historical_period"],
                    reading_time=data["reading_time"],
                    difficulty=data["difficulty"],
                    source_url=data.get("source_url", ""),
                    source_name=data.get("source_name", ""),
                    category=root_category,
                    is_published=True,
                )

                for lang_code, translations in data["translations"].items():
                    story.set_current_language(lang_code)
                    story.title = translations["title"]
                    story.summary = translations["summary"]
                    story.content = translations["content"]
                    story.audio_transcript = translations["audio_transcript"]
                    story.save()

                self.stdout.write(self.style.SUCCESS(f"Created story: {story.slug} ({story})"))

        self.stdout.write(self.style.SUCCESS("Storytelling seeding completed successfully."))
