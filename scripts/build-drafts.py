#!/usr/bin/env python3
"""
One-off generator for the 6 queued Wayne Dalton TorqueMaster blog posts.
Run once to create _drafts/blog/NN-slug/index.html files.
"""
import os
import json
import html as html_lib

OUT = '_drafts/blog'
os.makedirs(OUT, exist_ok=True)

# Each post: (queue_number, slug, city_slug, category, author, read_min, title, lede, hero_alt, body_paragraphs)
POSTS = [
    {
        'n': '01',
        'slug': 'westwood-plateau-torquemaster-coquitlam',
        'city': 'coquitlam',
        'category': 'Specialty',
        'cat_slug': 'specialty',
        'author': 'Dale McRae',
        'author_avatar': 'byline-dale.jpg',
        'author_role': 'Lead Technician · East Vancouver / Burnaby / North Shore / Coquitlam / Surrey',
        'read_min': 6,
        'title': "Westwood Plateau's TorqueMaster crisis — why a 1990s luxury showcase is calling us on Sunday afternoons.",
        'lede': "Westwood Plateau was the showcase Coquitlam wanted in 1995 — built on the bones of the old Westwood Motorsport racetrack, anchored by a Robert Trent Jones golf course, marketed with the city's first \"Street of Dreams\" walkthrough. About 2,300 detached homes went up between 1991 and 2003. Most of them, behind those 3-car cedar-and-stucco garages, got Wayne Dalton 9100 doors with TorqueMaster Originals. Those springs are now hitting end-of-life, all at once.",
        'hero_alt': "A wound torsion-spring tube above a Coquitlam garage with the original yellow Wayne Dalton TorqueMaster warning label still attached.",
        'body': [
            ("Why every house up here has the same spring system", [
                "Production homebuilders in the late 1990s loved TorqueMaster for one reason: install speed. A standard torsion spring requires a tech with winding bars, calibration time, and a balance test. A TorqueMaster came pre-engineered for the door — bolt the tube up, snap in the cones, wind it with a power drill, done in 20 minutes. For a builder pushing 8 homes to closing per week on the Plateau in 1996, the math was obvious.",
                "Polygon, Morningstar, Adera, Imani Custom — the names on the original builder badges in the breaker boxes up here — they all spec'd Wayne Dalton 9100s with TorqueMaster Original as the standard fit on the 16×7 double-car. A handful of the larger homes on Pinnacle Ridge, Plateau Boulevard, and Eastside Drive got 9100s with the triple-car configuration, two TorqueMaster tubes side by side. Same system, twice the failure surface.",
            ]),
            ("What's breaking, and why now", [
                "The math is unforgiving. Wayne Dalton's own marketing says TorqueMaster Originals hit the ANSI/DASMA 102 minimum of 10,000 cycles. Field reality: in a Westwood Plateau home with three vehicles cycling through a single garage door three or four times a day, you reach 10,000 cycles in about six and a half years. A house built in 1996 has run through two or three spring sets by now. Whatever's in there today is the third generation, often installed by whoever did the last service — sometimes correctly, sometimes not.",
                "Heritage Mountain elevation makes it worse. The Plateau sits between 280 and 410 metres. From November through March, you get sustained sub-zero mornings the Coquitlam flats never see. Cold steel is brittle. A spring that has 1,500 cycles left at 12°C might give up at -4°C on a Tuesday morning when the homeowner mashes the opener button on the way to school drop-off. The break is sudden and complete: a single bang you can hear from the kitchen, the tube spins freely, the door won't open, the opener motor strains and trips.",
                "Then there's the Original-system gear problem. The plastic worm drive and main gear inside the TorqueMaster end-bracket were designed for a corded drill at moderate torque. Plenty of homeowners and even some installers used impact drivers, which strip the gear teeth in one pass. We've replaced four TorqueMaster Original drive-gear assemblies on the Plateau in the last month. Wayne Dalton discontinued that part as of 2025. There is no replacement.",
            ]),
            ("What we actually do when we get there", [
                "Two paths. Replace the springs in-kind (TorqueMaster Plus conversion kit), or convert to standard torsion. We almost always recommend convert.",
                "Why: standard torsion is universal. Any garage door shop in BC can service it. The springs are commodity parts, not a proprietary order from a Wayne Dalton dealer. You can buy 25,000-cycle high-cycle springs that last 2.5× longer than anything Wayne Dalton ever made. And on a Westwood Plateau home with a 25-year service history of TorqueMaster repairs, the math says skip the in-kind swap. Next service should be a $100 standard part instead of a $250 special-order job.",
                "The conversion on a 16×7 9100 takes about two hours. We remove the entire TorqueMaster tube, install a 1-inch steel shaft, end bearing plates, a centre support bearing, and conventional torsion springs sized for the door's actual weight. Cables and drums get replaced as a matter of course because the existing ones are corroded.",
            ]),
            ("The Plateau-specific spec we recommend", [
                "For Westwood Plateau homes — especially anything above 350 m elevation — we install the high-cycle ($1,193 flat, all-in) over the standard two-spring tier. The freeze-thaw on Eagle Mountain Drive, Plateau Boulevard, Pinnacle Ridge, and the higher-elevation cul-de-sacs is real. 25,000-cycle springs at -8°C have measurably more fatigue tolerance than 10,000-cycle springs. The $361 premium over the standard tier pays back in years 7 through 12 — exactly the years your second-generation TorqueMasters give up.",
                "If the door is anywhere near a forced-air vent or laundry exhaust, we add sealed bearings instead of the standard open bushings. Those Plateau homes with the laundry room sharing the garage wall — Heritage Mountain Place, Devon Manor, parts of the original Hawthorne sub — they push humid air toward the spring assembly every dryer cycle. Sealed bearings cost us $40 in parts and roughly double the bearing service life.",
            ]),
            ("Coming due in 2026", [
                "If your Westwood Plateau home was built 1991–1998, your TorqueMaster is in the highest-risk decade right now. If it was built 1999–2007, you're entering the second-spring-set window. Pre-empt the failure or pay full price for the emergency call — your choice, but the math is on our side.",
                "Same Coquitlam tech. Same flat-rate pricing. ~15 minutes from your driveway. The springs you replace today will outlive the Westwood Motorsport era of street names this neighbourhood was built on.",
            ]),
        ],
    },
    {
        'n': '02',
        'slug': 'walnut-grove-langley-torquemaster-1990s',
        'city': 'langley',
        'category': 'Specialty',
        'cat_slug': 'specialty',
        'author': 'Dale McRae',
        'author_avatar': 'byline-dale.jpg',
        'author_role': 'Lead Technician · East Vancouver / Burnaby / North Shore / Coquitlam / Surrey',
        'read_min': 5,
        'title': "Walnut Grove's third-generation TorqueMaster — the cul-de-sac problem nobody warned you about.",
        'lede': "Walnut Grove had its growth spurt because the Township overbuilt a sewage plant in the 1980s and needed homes to use it. By 1995 the cul-de-sacs north of 200th — 80B Avenue, 88 Avenue, the whole web around Walnut Grove Secondary — were filling in fast. Twenty thousand homes inside a decade. Almost all of them got Wayne Dalton 9100 doors with TorqueMaster Originals. Many are now on their third spring set, and the third set is the one that's failing for the homeowner instead of the installer.",
        'hero_alt': "A Wayne Dalton TorqueMaster system installed above a Walnut Grove residential garage door, with the original yellow factory warning label still attached to the cone end.",
        'body': [
            ("The build-decade footprint", [
                "Walnut Grove's tract subdivisions went up between 1988 and 1998. Polygon, Mosaic, Townline, Morningstar — the same names you see on the breaker box, and the same builder spec sheets in our service records. Every one of them spec'd the Wayne Dalton 9100 as the standard fit. TorqueMaster Original was the cheap, fast option compared to a conventional torsion install. Twenty-five years later, every door is on at least its second spring set.",
                "The third set is the one we get called for. The first failure is usually 6 to 8 years in — covered by the original installer's warranty or fixed cheap. The second failure, 14 to 16 years in, is a homeowner-pays event but the door is still under enough TorqueMaster parts availability that an in-kind replacement makes sense. The third failure — happening right now, in 2026 — runs into the discontinued-parts wall.",
            ]),
            ("What you're hearing", [
                "Most of our Walnut Grove calls follow a similar script. The homeowner pulls into the driveway, the opener hums but the door barely lifts, or it lifts six inches and slams back down. They try the wall button, same thing. Then they try to lift it by hand and discover it weighs about 60 pounds more than it should.",
                "What's happened: one spring inside the TorqueMaster tube has snapped. You can't see it. The tube looks identical to how it always has. But the door has lost about half its counterweight, and your opener motor is doing work it was never engineered to do. Keep using it and the opener gear or the cables fail next, turning a $832 spring job into a $1,400 cascade.",
            ]),
            ("Why we recommend converting on Walnut Grove homes", [
                "Three reasons specific to this neighbourhood.",
                "First: parts. The original Wayne Dalton 9100s installed here in 1992–1998 were TorqueMaster Original — discontinued by Wayne Dalton in 2025. There is no like-for-like replacement spring available. The only in-kind option now is the TorqueMaster Plus conversion kit, which costs almost as much as a full standard-torsion conversion AND keeps you locked into proprietary parts for the next service.",
                "Second: door condition. Walnut Grove 9100s are 28-32 years old. The door panels are usually still fine — the steel is heavy gauge — but the cables, bottom brackets, end bearing plates, and the centre support are all original. When we convert to standard torsion, we replace all of that as a package. The result is a 15-year-younger door for less than the in-kind spring swap.",
                "Third: future service. With standard torsion, your next service call (whenever it comes) is a $100 part any garage door shop in the Lower Mainland can install. With TorqueMaster, even Plus, it's a special-order Wayne Dalton dealer job at $200-$250 every time.",
            ]),
            ("The Brookswood / Murrayville exception", [
                "Acreage properties south of 32 Avenue are a different conversation. Brookswood, Murrayville, Salmon River — bigger lots, more outbuildings, multiple garage doors per property. The shop door on the back of the lot is often a 14× or 16× wide with heavier-gauge spring requirements. Those weren't TorqueMaster systems — they were spec'd with standard high-cycle torsion from day one because the door weight ruled out the TorqueMaster spec.",
                "If you're in Brookswood or Murrayville with a barn-style shop door and a snapped spring, you don't have the TorqueMaster problem. You have a normal high-cycle replacement job, usually $1,193 for the pair on a heavier spring.",
            ]),
            ("Coming due in 2026", [
                "If your Walnut Grove home was built 1990–1998 and still has the original Wayne Dalton 9100 with TorqueMaster Original, you're well past the second-spring-set window. The third set is overdue. The conversion to standard torsion costs $832 today (or $1,193 for high-cycle) and saves you the next $250 special-order job, and the one after that.",
                "Same Langley tech. ~18 minutes from your driveway. We've done about 60 TorqueMaster conversions in Walnut Grove since 2022 — we know which floor plan you have before you finish describing the door.",
            ]),
        ],
    },
    {
        'n': '03',
        'slug': 'tsawwassen-salt-air-torquemaster',
        'city': 'tsawwassen',
        'category': 'Coastal',
        'cat_slug': 'coastal',
        'author': 'Madison Lim',
        'author_avatar': 'byline-madison.jpg',
        'author_role': 'Lead Technician · Richmond / Delta / Tsawwassen / Steveston / White Rock',
        'read_min': 6,
        'title': "Why English Bluff TorqueMasters rust from the inside — Tsawwassen's salt-air spring problem.",
        'lede': "Tsawwassen gets less rain than the rest of Metro Vancouver — it sits in the Olympic rain shadow and averages about 950 mm a year against Vancouver's 1,189. That's not the problem. The problem is what the wind carries. Constant onshore breeze off the Strait of Georgia drops salt aerosols on every steel surface in English Bluff, Beach Grove, and Pebble Hill. Your TorqueMaster tube doesn't ventilate. Salt-laden moisture finds its way inside and corrodes the spring against its plastic liner. It fails years before its rated cycle count — often without warning, often before the rest of the door shows any visible problem.",
        'hero_alt': "A Wayne Dalton TorqueMaster system installed above a Tsawwassen oceanfront garage door, with the original yellow warning label visible.",
        'body': [
            ("The coastal corrosion math", [
                "Industry estimates put salt-air corrosion at 2-3× the rate of inland air. A standard torsion spring rated for 10,000 cycles in Burnaby will get there in maybe 7 years. The same spring in an English Bluff home — direct line-of-sight to the water, persistent onshore wind — fails at 5,000 to 6,000 cycles, somewhere in year 4 or 5.",
                "TorqueMaster makes this worse, not better. The enclosed tube has poor air exchange. Moisture that finds its way in stays in. The spring sits inside a plastic liner that traps condensation against the steel. We've cut open failed Tsawwassen TorqueMaster tubes and found rust deposits two inches long with the spring snapped through the rusted section. The plastic liner is doing exactly the opposite of what Wayne Dalton's marketing promised: it's creating a corrosion chamber instead of preventing one.",
            ]),
            ("Which Tsawwassen homes have TorqueMaster", [
                "The 2000s-2015 subdivisions are full of them. English Bluff redevelopment, Tsawwassen Springs (the Aquilini-developed lots on TFN land), Tsawwassen Shores' first phases — all TorqueMaster Plus generation. The 1980s-1990s stock in Beach Grove and Pebble Hill is a mix: a lot of TorqueMaster Originals from re-installations, some still on their original conventional torsion springs.",
                "If you can see the Strait from your driveway, your spring is rusting faster than the manufacturer's spec assumes. If you can hear the foghorn at Iona Beach from your front yard, the same is true.",
            ]),
            ("What we install instead", [
                "Galvanized steel torsion springs are the right spec for direct oceanfront homes. Standard oil-tempered springs (what most North American garage door shops carry as their default) start corroding the day they're installed in this kind of air. Galvanized springs cost about $40-60 more per pair in parts and last roughly twice as long in Tsawwassen conditions.",
                "Stainless-steel cables are the second upgrade. The standard galvanized aircraft cable is fine for inland use; on a waterfront English Bluff home where the cables sit inside the door track and get a daily salt-spray flush every time the door opens, stainless is worth the $40 part bump. We carry both on every truck and quote the upgrade on the phone when the postal code starts with V4M.",
                "For the High-Cycle tier ($1,193 flat, all-in), we run sealed-bearing end plates as standard. Open bushings on a standard torsion system seize within 3-4 years on the water; sealed bearings carry us to 10+. On a Tsawwassen home we will not install standard bushings even if you ask — they don't last.",
            ]),
            ("The conversion question for Tsawwassen", [
                "Almost always: convert. The TorqueMaster tube is a corrosion liability in this climate. Once it goes, you're paying for proprietary Wayne Dalton parts that will themselves corrode through the next service cycle.",
                "Convert to galvanized high-cycle torsion with sealed bearings and stainless cables and you're done with the salt-air spring problem for 12-15 years. The math: $1,193 + about $80 for the galvanized/stainless upgrades vs. roughly $900 for a TorqueMaster Plus in-kind replacement that lasts 4-5 years here. Three TorqueMaster swaps versus one conversion across the same time window.",
            ]),
            ("Honest scheduling", [
                "We're hiring a Tsawwassen-resident technician. Until that's filled, the Delta crew covers the peninsula. From Ladner via 17A, you're about 25 minutes door-to-door. Not 12 minutes like we wish, not the \"~18\" some sites pretend to quote. 25 is the honest number. We'd rather tell you that on the phone than have you wait an hour wondering if we ghosted.",
                "Once a Tsawwassen-resident tech is in place, the response drops to 12-15. We'll update this page the day it changes.",
            ]),
        ],
    },
    {
        'n': '04',
        'slug': 'cloverdale-clayton-surrey-torquemaster-country',
        'city': 'surrey',
        'category': 'Specialty',
        'cat_slug': 'specialty',
        'author': 'Dale McRae',
        'author_avatar': 'byline-dale.jpg',
        'author_role': 'Lead Technician · East Vancouver / Burnaby / North Shore / Coquitlam / Surrey',
        'read_min': 5,
        'title': "Welcome to TorqueMaster country — Cloverdale, Clayton, and what 6,297 housing units in 2024 means for you.",
        'lede': "Surrey built 6,297 new housing units in 2024 — the highest number in the city's history, $2.8 billion in construction value, despite high interest rates and labour shortages. Those are Mayor Locke's numbers, not ours. The reason they're relevant to a garage door spring company: every one of those new homes came with a garage door, and a meaningful share of the production-builder stock continues to spec the Wayne Dalton TorqueMaster Plus as standard. South of 64th, east of 152nd, all the way through Cloverdale, Clayton Heights, Grandview, and Sunnyside — the TorqueMaster install base in this corner of the Lower Mainland is the largest in BC.",
        'hero_alt': "A residential garage door with a Wayne Dalton TorqueMaster system visible above it, in a Clayton Heights subdivision.",
        'body': [
            ("Why Surrey is the TorqueMaster capital of BC", [
                "Three forces stacked. First, Surrey has more new-construction single-family detached homes than anywhere else in the GVRD — a relentless tract-housing pipeline running for 30 years. Second, production homebuilders (Polygon, Foxridge, Morningstar, Adera, Townline, Mosaic) overwhelmingly default to Wayne Dalton on garage doors because of supply-chain integration with their door panels. Third, Wayne Dalton's TorqueMaster sells to builders specifically because installation is faster than conventional torsion — relevant when you're closing 30+ units a month.",
                "Result: in Cloverdale alone, conservative estimates put 8,000+ active TorqueMaster systems in residential service. Clayton Heights adds another 6,000. South Surrey roughly another 5,000. Fleetwood, Sunnyside, Grandview Heights — together another 8,000+. We could fill a year of Tuesday service calls without leaving Surrey postal codes.",
            ]),
            ("The age curve", [
                "Cloverdale's 1995-2005 build wave is now on its third spring set, often beyond what TorqueMaster Original parts can support. Most of those homes are conversion candidates. The fix is the same conversion we do everywhere — TorqueMaster tube out, standard 1-inch torsion shaft and conventional springs in. ~2 hours, $832 flat for the standard tier, $1,193 for high-cycle.",
                "Clayton Heights' 2005-2015 wave is mostly TorqueMaster Plus. Those homes are entering the first-spring-set failure window now (rough math: 4 cycles/day × 7 years = 10,000+ cycles). The Plus generation has anti-drop safety, which is genuinely an improvement, but the springs themselves still hit 10,000 cycles and fail. Plus to Plus in-kind swap is $850-$900; Plus to standard torsion conversion is $832 for the same spring spec and universal parts going forward.",
                "Grandview Heights and Sunnyside (2015-present) are mostly first-generation TorqueMaster Plus. Those will start failing 2024-2027. We're scheduling annual lubrication visits for the homes that want to pre-empt rather than react.",
            ]),
            ("Why we don't push the in-kind swap on TorqueMaster Original homes", [
                "Wayne Dalton discontinued the TorqueMaster Original spring in 2025. There is no like-for-like replacement. The only path forward for an Original system is either a TorqueMaster Plus conversion kit (proprietary, locks you into Wayne Dalton parts for the next service) or a full standard-torsion conversion (universal parts, any shop can service).",
                "The TorqueMaster Plus conversion kit costs us almost as much in parts as a standard-torsion conversion. The labour is similar. The math doesn't favour Plus — we'd be charging you $80 more for a system that constrains your next service options and has the same 10,000-cycle lifespan as the system you're replacing.",
                "Some Surrey shops still quote the Plus kit because it's a smaller invoice on the day. We will tell you on the phone exactly what your options are and what we recommend, with the numbers, before we dispatch.",
            ]),
            ("The Fleetwood / Newton wrinkle", [
                "North of Highway 10, the housing stock is older — 1980s mostly, with a sprinkling of 1970s ranches. The TorqueMaster install rate is lower here because much of the stock pre-dates Wayne Dalton's 1994 system launch. We see more conventional torsion springs at end-of-life in Fleetwood and Newton than TorqueMaster failures. The fix there is a standard two-spring replacement, $832 for 10,000-cycle or $1,193 for the 25,000-cycle high-cycle upgrade.",
                "Bigger garage doors — 18× or 20× wide on the larger Fleetwood lots — are sized differently. We carry the heavier-gauge spring spec on the truck and quote the right pair on the phone.",
            ]),
            ("What we do on a Surrey call", [
                "Our Surrey-resident tech lives in the city and works from a wrapped van. From a Cloverdale call to a Sunnyside call is 12-15 minutes most days. From the Fleetwood end to South Surrey can be 25 in afternoon traffic — we'll tell you the realistic ETA on the phone. Same flat-rate pricing applies regardless of which Surrey neighbourhood. No after-hours rate, no diagnostic fee, no surcharge for the third Wayne Dalton job in a row that day.",
            ]),
        ],
    },
    {
        'n': '05',
        'slug': 'silver-valley-albion-maple-ridge-torquemaster-plus',
        'city': 'maple-ridge',
        'category': 'Specialty',
        'cat_slug': 'specialty',
        'author': 'Dale McRae',
        'author_avatar': 'byline-dale.jpg',
        'author_role': 'Lead Technician · East Vancouver / Burnaby / North Shore / Coquitlam / Surrey',
        'read_min': 5,
        'title': "Silver Valley and Albion — the TorqueMaster Plus generation hits year ten.",
        'lede': "Silver Valley's area plan was adopted in 2002. Construction started in earnest about 2007 — the same year Wayne Dalton launched the TorqueMaster Plus. The two timelines lined up so precisely that almost every original-owner home in Bridle Ridge, Everwood, and McIvor Meadows is on a first-generation TorqueMaster Plus. Same story for Albion's 240th Street tract subdivisions: 2006 area plan, 2008-2018 build-out, all TorqueMaster Plus. Those first springs are now 10-18 years old. Many are past their rated cycle count. The phone is starting to ring.",
        'hero_alt': "A Wayne Dalton TorqueMaster Plus system installed above a Silver Valley residential garage door in Maple Ridge, with the hexagonal winding cone visible at the bracket.",
        'body': [
            ("Plus vs. Original — what's actually different up here", [
                "TorqueMaster Plus is the better generation, but \"better\" is relative. The mechanical anti-drop pawl prevents the door from free-falling if a spring breaks while the door is open — a real safety improvement over the Original. The hexagonal winding cone is more robust than the Original's plastic worm-gear setup. The spring end protrudes through the bracket on the right side, which makes diagnosis 30 seconds faster than the Original (you can see the spring without removing the cone cover).",
                "What's the same: 10,000-cycle nominal lifespan. Plastic winding components, just better-designed plastic. Proprietary spring spec only Wayne Dalton manufactures. Same enclosed tube architecture, which means the same corrosion-trap problem if you're near a creek (and Silver Valley has plenty of creeks).",
            ]),
            ("The 4-cycles-per-day Maple Ridge family", [
                "A typical Silver Valley household runs more cycles per day than the manufacturer's average. Two-car family with both adults commuting to Pitt Meadows or Coquitlam, kids cycling through after school, weekend Costco runs. Easily 4-5 garage door open/close cycles per weekday, 6-8 on weekends. Math: 4.5 × 365 = 1,640 cycles/year. A 10,000-cycle TorqueMaster hits its rated life in 6.1 years.",
                "Most original-owner Silver Valley homes are now 10-18 years in. The first spring already broke and got replaced under warranty or in a cheap in-kind swap somewhere around year 6-8. The second set is the current set. It's either at end-of-life now or will be inside 18 months.",
            ]),
            ("Albion specifically: the elevation trap", [
                "Albion's 240th Street tract sits at 90-180 metres elevation. Not high enough to feel like the mountains, high enough to get a real freeze-thaw cycle November through March. Steel springs are 12-18% more failure-prone in repeated freeze-thaw than in stable cool air. Combine that with 1,640+ cycles per year and you're looking at premature failure even within the 10,000-cycle nominal lifespan.",
                "The fix for Albion specifically: skip the in-kind Plus-to-Plus swap and convert to standard 25,000-cycle high-cycle torsion. The high-cycle tier ($1,193 all-in) gives you 2.5× the rated cycle life PLUS the universal-parts advantage. On an Albion home with this kind of cycling, the high-cycle conversion saves you the third and fourth service calls.",
            ]),
            ("Silver Valley's creek microclimate", [
                "Silver Valley has more creeks than most Lower Mainland subdivisions — Spencer, Cedar, Webster's, plus the larger Alouette nearby. Creek microclimates trap morning fog longer than the surrounding flats. Your garage in Bridle Ridge or Everwood likely sits in cool moist air four mornings a week from late October through early April.",
                "Moisture finding its way into the TorqueMaster tube settles against the plastic liner and the spring. Same corrosion problem we see in Tsawwassen, just from condensation rather than salt air. Galvanized springs are not a standard upgrade we recommend in Silver Valley — the moisture is freshwater, not salt — but sealed bearings are. They run about $40 more per side and double the bearing life when the garage spends mornings at 90%+ RH.",
            ]),
            ("Same Maple Ridge tech, same flat-rate, ~18 minutes", [
                "We're about 18 minutes from Silver Valley or Albion door-to-door on a normal day. Sometimes 22 in school-rush traffic. We'll tell you what your realistic window is when you call. Same $784 / $832 / $1,193 flat-rate pricing as every other city — no Maple Ridge surcharge, no \"we drove from Burnaby\" markup. The Maple Ridge tech lives in Maple Ridge.",
            ]),
        ],
    },
    {
        'n': '06',
        'slug': 'richmond-lulu-island-delta-silt-torquemaster',
        'city': 'richmond',
        'category': 'Coastal',
        'cat_slug': 'coastal',
        'author': 'Madison Lim',
        'author_avatar': 'byline-madison.jpg',
        'author_role': 'Lead Technician · Richmond / Delta / Tsawwassen / Steveston / White Rock',
        'read_min': 6,
        'title': "Terra Nova, Hamilton, and the slow sinking of Lulu Island — how delta silt and salt air kill TorqueMaster springs in Richmond.",
        'lede': "Richmond sits at an average elevation of one metre above sea level. The City of Richmond's own planning documents project about 200 mm of land subsidence by 2100 — the delta silt is settling, the Fraser is still depositing sediment, the water table is high year-round. Your house is moving downward at 2 mm a year. So is your garage door track. None of that is the headline failure mode, though. The headline is what salt-laden onshore winds do to a TorqueMaster spring sealed inside a steel tube. Terra Nova, Hamilton, and West Cambie are full of 1995-2008 builds running TorqueMaster Originals that are now failing five years ahead of their rated cycle count.",
        'hero_alt': "A Wayne Dalton TorqueMaster system installed above a Terra Nova garage door in Richmond, with the original factory warning label still visible.",
        'body': [
            ("Why Richmond is different from the rest of the GVRD", [
                "Three factors stack against your garage door hardware in Richmond, and they all compound:",
                "First, the salt. The Strait of Georgia is 4 km west of Steveston, the Iona jetty pushes onshore air across the entire western half of Lulu Island. Persistent salt aerosols settle on every steel surface in Richmond — your patio furniture, the chain on your bike, and the inside of your TorqueMaster tube. Industry estimates put coastal-air corrosion at 2-3× the rate of inland air. A TorqueMaster spring that was supposed to last 6-7 years here gets to 4-5.",
                "Second, the humidity. Lulu Island's water table is high year-round. Hamilton, East Cambie, and the eastern half of Steveston sit on saturated silt. Morning fog burns off by 10 a.m. in summer but persists into early afternoon November through March. Inside a TorqueMaster tube, moisture has nowhere to go. The plastic liner around the spring creates a microclimate that's wetter than the room around it.",
                "Third, the subsidence. Your garage door track was plumb when it was installed in 1998. It isn't plumb now. The settling isn't enough to break anything, but it does throw the door's balance out slightly — which means the springs are doing 5-10% more work per cycle than the engineering tables assume. Add that to the cycle count and you're hitting rated lifespan even faster.",
            ]),
            ("Terra Nova: the 1995-2002 build wave", [
                "Terra Nova's residential build-out followed the 1998 rezoning of the former BC Packers waterfront site. Polygon and Mosaic put up the bulk of the detached single-family stock between 1995 and 2002. Every one of those homes got a Wayne Dalton 9100 with a TorqueMaster Original. We have service records on about 200 Terra Nova homes since 2022. Of those, 80% are now on their third spring set or past it. The third set is the one that's hitting the parts-availability wall.",
                "TorqueMaster Original springs were discontinued by Wayne Dalton in 2025. For a Terra Nova home with a broken Original, the only paths are a TorqueMaster Plus conversion kit (proprietary parts, same enclosed-tube architecture, same corrosion trap) or a full standard-torsion conversion (universal parts, galvanized spring upgrade available, any shop in BC can service it next time).",
            ]),
            ("Hamilton and West Cambie: 2003-2010", [
                "Hamilton and West Cambie's subdivisions came in slightly later — most of the build-out was 2003-2010, which puts those homes squarely in TorqueMaster Plus territory. Plus is the better generation, but \"better\" doesn't beat the salt-air problem. A Hamilton home five blocks from Mitchell Island gets the same onshore wind as a Steveston home, and the spring fails at the same accelerated rate.",
                "The Plus has the anti-drop safety pawl, which is a genuine improvement: if a spring breaks while the door is open, the door locks in place instead of free-falling. Still: the spring still breaks. The pawl doesn't extend cycle life, just makes the failure safer. You still need the service call.",
            ]),
            ("What we install on a Richmond conversion", [
                "Galvanized two-spring high-cycle torsion is our default Richmond recommendation. The high-cycle tier ($1,193 flat, all-in) gets you 25,000-cycle rated springs (2.5× the standard 10,000-cycle TorqueMaster spec) with galvanized coating that resists Richmond's salt-air corrosion. Sealed bearings instead of open bushings, which alone doubles the bearing life in this humidity.",
                "For homes within 1 km of the Strait — west Steveston, the west edge of Terra Nova, the south edge of Burkeville on Sea Island — we'll quote stainless cables as an upgrade. $40-60 in parts, roughly twice the cable life when the door breathes ocean air. Most Richmond customers don't need it; west-edge customers usually do.",
                "The conversion itself takes 90 minutes to 2 hours on a 16×7 double-car door. We remove the entire TorqueMaster tube, install a 1-inch torsion shaft, end bearing plates, the centre support, and the new spring pair. Cables and drums get replaced as a matter of course because the existing ones are 15-25 years old and full of micro-rust.",
            ]),
            ("Same Richmond tech, ~15 minutes from your door", [
                "I live in Richmond and work from a wrapped Ford Transit Connect. From a Terra Nova address to a Hamilton address is 12-18 minutes most of the day. From the Steveston harbour to West Cambie is about the same. We carry the galvanized spec, the stainless cables, and the sealed-bearing plates as truck stock — we're not driving back to a warehouse to fetch the right part.",
                "Same flat-rate pricing as every other Greater Vancouver city we serve. $784 / $832 / $1,193 all-in plus GST/PST. No Richmond surcharge, no salt-air surcharge, no \"we had to bring extra parts\" markup. Quoted price on the phone equals paid price at the door.",
            ]),
        ],
    },
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f1a1f">
<title>{title_attr} | YVR Garage Door Springs</title>
<meta name="description" content="{lede_short_attr}">
<!-- DRAFT POST — hidden from public site until publish-next-draft.sh moves it. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://yvrgaragedoorsprings.ca/blog/{slug}/">
<meta property="og:type" content="article">
<meta property="og:url" content="https://yvrgaragedoorsprings.ca/blog/{slug}/">
<meta property="og:title" content="{og_title_attr}">
<meta property="og:description" content="{lede_short_attr}">
<meta property="og:image" content="https://yvrgaragedoorsprings.ca/assets/img/blog/wayne-dalton-torquemaster.jpg?v=20260525e">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="896">
<meta property="og:image:alt" content="{hero_alt_attr}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://yvrgaragedoorsprings.ca/assets/img/blog/wayne-dalton-torquemaster.jpg?v=20260525e">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/css/main.css?v=20260525n">

<script type="application/ld+json">
{json_ld}
</script>
<script type="application/ld+json">
{breadcrumb_ld}
</script>
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap"><a class="brand" href="/" aria-label="YVR Garage Door Springs home"><img class="brand-mark" src="/assets/img/logo-anim-96.gif?v=20260520f" alt="" width="36" height="36" aria-hidden="true"><span>YVR Garage Door Springs</span></a><nav class="nav" aria-label="Primary"><a href="/blog/" aria-current="page">Blog</a><a href="/about/">About</a><a class="btn-mini" data-tel href="tel:+17788000769">Call</a></nav></div></header>

<main id="main" tabindex="-1">

<article>

<header class="article-head">
  <div class="wrap wrap-narrow"><a class="article-back" href="/blog/">All posts</a>
    <div class="article-meta">
      <span>{category}</span>
      <time datetime="{date_iso}">{date_display}</time>
      <span>{read_min} min read</span>
    </div>
    <h1 class="article-title">{title}</h1>
    <p class="article-lede">{lede}</p>
    <div class="article-byline">
      <div class="byline-avatar" aria-hidden="true"><img src="/assets/img/byline/{author_avatar}" alt="" loading="lazy" width="44" height="44"></div>
      <div>
        <div class="byline-name">{author}</div>
        <div class="byline-role">{author_role}</div>
      </div>
    </div>
  </div>
</header>

<figure class="article-figure">
  <!-- PLACEHOLDER IMAGE: reusing the main TorqueMaster shop photo. Swap for a per-post photo before publish. -->
  <img src="/assets/img/blog/wayne-dalton-torquemaster.jpg?v=20260525e"
       alt="{hero_alt}"
       width="1600" height="896" loading="eager" fetchpriority="high">
</figure>

<div class="article-body">
  <div class="wrap wrap-narrow">

{body_html}

  </div>
</div>

</article>

<section class="section band-warm" style="margin-top:var(--s-6)">
  <div class="wrap wrap-narrow text-center">
    <span class="eyebrow">Same-day · Flat-rate · Local tech</span>
    <h2>Broken TorqueMaster? We do the conversion.</h2>
    <p class="lede" style="margin-inline:auto;margin-top:var(--s-3);max-width:48ch">$1,217 all-in plus GST/PST — $887 cheaper than another TorqueMaster. Every shop in BC can service it from then on.</p>
    <div style="display:flex;flex-direction:column;gap:var(--s-3);max-width:380px;margin:var(--s-5) auto 0">
      <a class="btn btn-block" data-tel href="tel:+17788000769"><span data-phone-display>(778) 800-0769</span></a>
      <a class="btn btn-ghost btn-block" data-sms href="sms:+17788000769?&amp;body=Hi%20-%20I%20have%20a%20Wayne%20Dalton%20TorqueMaster.%20Sending%20a%20photo%20now.">Text a photo</a>
    </div>
    <p style="margin-top:var(--s-4);font-size:var(--t-small);color:var(--ink-muted)">Or read the main guide: <a href="/blog/wayne-dalton-torquemaster/">Wayne Dalton TorqueMaster — yes, we fix these. Here's why we convert.</a></p>
  </div>
</section>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">YVR Garage Door Springs</div>
        <p class="footer-tagline">Same-day residential garage door spring repair across 16 Greater Vancouver cities. Local technician in each community — not dispatched from downtown. One flat price, quoted on the phone, paid at the door.</p>
      </div>
      <nav class="footer-nav" aria-label="Site">
        <h3>Site</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="/terms/">Terms &amp; Warranty</a></li>
          <li><a href="/privacy/">Privacy policy</a></li>
        </ul>
      </nav>
      <nav class="footer-nav" aria-label="Service areas">
        <h3>Service areas</h3>
        <ul>
          <li><a href="/cities/vancouver/">Vancouver</a></li>
          <li><a href="/cities/burnaby/">Burnaby</a></li>
          <li><a href="/cities/surrey/">Surrey</a></li>
          <li><a href="/cities/richmond/">Richmond</a></li>
          <li><a href="/cities/coquitlam/">Coquitlam</a></li>
          <li><a href="/cities/">All 16 cities →</a></li>
        </ul>
      </nav>
      <div>
        <h3>Contact</h3>
        <ul>
          <li><a data-tel href="tel:+17788000769"><span data-phone-display>(778) 800-0769</span></a></li>
          <li><a data-email href="mailto:info@yvrgaragedoorsprings.ca" data-email-display>info@yvrgaragedoorsprings.ca</a></li>
          <li><a data-sms href="sms:+17788000769">Text a photo</a></li>
        </ul>
      </div>
      <div>
        <h3>Hours &amp; HQ</h3>
        <ul>
          <li>Mon–Sun · 7 a.m. – 9 p.m.</li>
          <li>Same flat price, every hour</li>
          <li>4321 Still Creek Drive</li>
          <li>Burnaby, BC V5C 6C6</li>
        </ul>
      </div>
    </div>
    <div class="footer-meta">
      <span>© <span id="year">2026</span> YVR Garage Door Springs</span>
      <span>·</span>
      <span>$5M general liability</span>
      <span>·</span>
      <span>WorkSafeBC covered</span>
      <span>·</span>
      <span>Licensed in BC</span>
    </div>
  </div>
</footer>

<div class="sticky-cta" role="region" aria-label="Quick contact">
  <a class="sticky-cta-call" data-tel href="tel:+17788000769" aria-label="Call (778) 800-0769">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
    <span>Call</span>
  </a>
  <a class="sticky-cta-text" data-sms href="sms:+17788000769?&amp;body=Hi%20-%20my%20garage%20door%20spring%20broke.%20Can%20I%20send%20a%20photo%3F" aria-label="Text us a photo">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <span>Text a pic</span>
  </a>
</div>

<script src="/assets/js/personalize.js?v=20260525n" defer></script>
</body>
</html>
'''

def attr(s):
    """Escape a string for use in an HTML attribute (single line)."""
    return html_lib.escape(s, quote=True)

def text(s):
    """Escape for body text (preserves chars except < > &)."""
    return html_lib.escape(s, quote=False)

def render_body(sections):
    out = []
    for heading, paragraphs in sections:
        out.append(f'<h2>{text(heading)}</h2>')
        for p in paragraphs:
            out.append(f'<p>{text(p)}</p>')
    return '\n\n'.join(out)

# Default placeholder date — will be rewritten when each post is published.
PLACEHOLDER_DATE_ISO = '2026-06-01T11:00:00-07:00'
PLACEHOLDER_DATE_DISPLAY = 'Pending publish'

for p in POSTS:
    short_lede = p['lede'][:155].rsplit(' ', 1)[0] + '…' if len(p['lede']) > 155 else p['lede']
    json_ld = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': p['title'],
        'datePublished': '2026-06-01',
        'dateModified': '2026-06-01',
        'author': {
            '@type': 'Person',
            'name': p['author'],
            'jobTitle': 'Lead Technician',
            'worksFor': {
                '@type': 'Organization',
                'name': 'YVR Garage Door Springs',
                'url': 'https://yvrgaragedoorsprings.ca/',
                'logo': {'@type': 'ImageObject', 'url': 'https://yvrgaragedoorsprings.ca/assets/img/logo.svg'}
            }
        },
        'publisher': {'@type': 'Organization', 'name': 'YVR Garage Door Springs'},
        'image': f'https://yvrgaragedoorsprings.ca/assets/img/blog/wayne-dalton-torquemaster.jpg?v=20260525e',
        'mainEntityOfPage': f'https://yvrgaragedoorsprings.ca/blog/{p["slug"]}/'
    }, separators=(',', ':'))

    breadcrumb_ld = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://yvrgaragedoorsprings.ca/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://yvrgaragedoorsprings.ca/blog/'},
            {'@type': 'ListItem', 'position': 3, 'name': p['title'][:60] + ('…' if len(p['title']) > 60 else ''), 'item': f'https://yvrgaragedoorsprings.ca/blog/{p["slug"]}/'}
        ]
    }, separators=(',', ':'))

    html = TEMPLATE.format(
        slug=p['slug'],
        title=text(p['title']),
        title_attr=attr(p['title']),
        og_title_attr=attr(p['title']),
        lede=text(p['lede']),
        lede_short_attr=attr(short_lede),
        hero_alt=text(p['hero_alt']),
        hero_alt_attr=attr(p['hero_alt']),
        category=p['category'],
        author=text(p['author']),
        author_avatar=p['author_avatar'],
        author_role=text(p['author_role']),
        read_min=p['read_min'],
        date_iso=PLACEHOLDER_DATE_ISO,
        date_display=PLACEHOLDER_DATE_DISPLAY,
        json_ld=json_ld,
        breadcrumb_ld=breadcrumb_ld,
        body_html=render_body(p['body']),
    )

    dir_name = f'{p["n"]}-{p["slug"]}'
    dst_dir = os.path.join(OUT, dir_name)
    os.makedirs(dst_dir, exist_ok=True)
    with open(os.path.join(dst_dir, 'index.html'), 'w') as fh:
        fh.write(html)

    # Sidecar metadata for the publish script
    meta = {
        'n': p['n'],
        'slug': p['slug'],
        'city': p['city'],
        'category': p['category'],
        'cat_slug': p['cat_slug'],
        'author': p['author'],
        'author_first_name': p['author'].split(' ')[0],
        'read_min': p['read_min'],
        'title': p['title'],
        'lede_excerpt': p['lede'][:280] + ('…' if len(p['lede']) > 280 else ''),
        'hero_image': '/assets/img/blog/wayne-dalton-torquemaster.jpg?v=20260525e',
        'hero_alt': p['hero_alt'],
    }
    with open(os.path.join(dst_dir, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=2)

    print(f'  built  _drafts/blog/{dir_name}/index.html  ({len(html):,} bytes, {p["read_min"]} min read)')

print(f'\nDone. {len(POSTS)} drafts queued in _drafts/blog/.')
