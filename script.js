/* ════════════════════════════════════════
   JOANNE'S RACCOON CHAOS GENERATOR
   script.js
════════════════════════════════════════ */

// ══════════════════════════════════
// STATE
// ══════════════════════════════════
let currentMode = 'random';
let soundOn     = false;
let audioCtx    = null;
let count       = 0;
let lastItem    = null;

try { count = parseInt(localStorage.getItem('joanneV4') || '0'); } catch(e){}
document.getElementById('counter').textContent = count;

// ══════════════════════════════════
// RACCOON CHITTER SOUND
// ══════════════════════════════════
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playChitter(intensity) {
  const ctx    = getCtx();
  const t      = ctx.currentTime;
  const bursts = intensity === 2 ? 12 : 6;
  const vol    = intensity === 2 ? 0.22 : 0.14;

  for (let i = 0; i < bursts; i++) {
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 700 + Math.random() * 800;
    filter.Q.value = 6 + Math.random() * 6;

    osc.type = 'sawtooth';
    const baseFreq = 280 + Math.random() * 360;
    osc.frequency.setValueAtTime(baseFreq, t + i * 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, t + i * 0.06 + 0.055);

    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 18 + Math.random() * 12;
    lfoGain.gain.value  = 25;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, t + i * 0.06);
    gain.gain.linearRampToValueAtTime(vol, t + i * 0.06 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.058);

    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(t + i * 0.06); lfo.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.065); lfo.stop(t + i * 0.06 + 0.065);
  }

  if (intensity === 2) {
    const sq = ctx.createOscillator(), sg = ctx.createGain();
    sq.type = 'sine';
    sq.frequency.setValueAtTime(1800, t + bursts * 0.06);
    sq.frequency.exponentialRampToValueAtTime(600, t + bursts * 0.06 + 0.12);
    sg.gain.setValueAtTime(0.12, t + bursts * 0.06);
    sg.gain.exponentialRampToValueAtTime(0.001, t + bursts * 0.06 + 0.12);
    sq.connect(sg); sg.connect(ctx.destination);
    sq.start(t + bursts * 0.06); sq.stop(t + bursts * 0.06 + 0.13);
  }
}

function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('soundIcon').textContent  = soundOn ? '🔊' : '🔇';
  document.getElementById('soundLabel').textContent = soundOn ? 'SOUNDS ON' : 'SOUNDS OFF';
  document.getElementById('soundToggle').classList.toggle('on', soundOn);
  if (soundOn) { try { playChitter(1); } catch(e){} }
}

function setMode(m) {
  currentMode = m;
  ['heist','advice','news','random'].forEach(id =>
    document.getElementById(`btn-${id}`).classList.toggle('active', id === m)
  );
}

// ══════════════════════════════════
// CONTENT — 20 PER CATEGORY
// ══════════════════════════════════
const heists = [
  { emoji:'🕵️🦝', title:'Operation: Trash Can Tuesday',
    body:`Three raccoons — <strong>Gerald</strong>, <strong>Linda</strong>, and <strong>Lil' Diablo</strong> — spent 6 weeks casing the Henderson neighborhood. Their target: the blue recycling bin with the loose lid on Maple Street. Gerald created a diversion by dramatically falling off a fence. Linda handled logistics. Lil' Diablo ate an entire pizza in under 90 seconds. <strong>They were never caught.</strong>` },
  { emoji:'🏦🦝', title:'The Great Dumpster Heist of 2023',
    body:`When Applebee's installed a "raccoon-proof" lid, the raccoon community took it as a personal attack. <strong>Mama Roxy</strong> assembled a crew of seven. They trained for two weeks. On a Tuesday at 3am, they breached the dumpster in <strong>under four minutes.</strong> The manager still doesn't know what happened. The raccoons celebrated with mozzarella sticks.` },
  { emoji:'🎭🦝', title:'The BBQ Caper',
    body:`Joanne, this one is personal. <strong>Chad the Raccoon</strong> saw your neighbor's BBQ and made a decision. He recruited his cousin <strong>Brenda</strong> and her three children (none of them listened but they came anyway). <strong>Four hot dogs were taken. Zero regrets were expressed.</strong> Chad still thinks about those hot dogs every single night.` },
  { emoji:'🎪🦝', title:'Mission: Impossible — Bird Feeder Edition',
    body:`The bird feeder was described by raccoon intelligence as "heavily fortified." <strong>They didn't care.</strong> Renegade Rick spent three nights developing a technique involving sheer upper body strength and a complete disregard for physics. He ate every seed. He looked directly at the security camera. <strong>He felt nothing.</strong>` },
  { emoji:'🍕🦝', title:'The Pizza Box Conspiracy',
    body:`Twelve raccoons. One pizza box. <strong>Zero coordination.</strong> They argued 45 minutes about who opens it. Two wandered off mid-meeting. Eventually <strong>Steve</strong> just opened it himself. Hawaiian pizza inside. Nobody wanted Hawaiian. <strong>They took it anyway.</strong>` },
  { emoji:'🚗🦝', title:'The Parking Lot Incident',
    body:`<strong>"The Professor"</strong> discovered a Wendy's dumpster was accessible from the top of a Toyota Camry. Dave, the Camry's owner, watched from inside the restaurant. Dave and The Professor made eye contact. <strong>Neither one looked away for a very long time.</strong> Dave did not confront The Professor. The Professor did not apologize.` },
  { emoji:'🥗🦝', title:"The Farmer's Market Situation",
    body:`The raccoon known only as <strong>Duchess</strong> had observed the farmer's market for three Saturdays. She identified the weakest vendor: artisanal jam. At 6:42am she made her move. <strong>She took four jars of blackberry preserves and one baguette.</strong> She was not seen again until the following Saturday. She brought a friend. <strong>The jam vendor now locks his van.</strong>` },
  { emoji:'🍣🦝', title:'The Sushi Incident',
    body:`Three raccoons obtained a bag of takeout sushi from a porch in under 90 seconds. <strong>Rodrigo</strong> handled the bag while <strong>Francesca</strong> acted as lookout. The third raccoon, <strong>Little Biscuit</strong>, mostly just sat there. The homeowner came out and yelled. Rodrigo made direct eye contact while eating a California roll. <strong>Rodrigo did not stop eating.</strong>` },
  { emoji:'💒🦝', title:'The Wedding Reception Catastrophe',
    body:`Raccoon intelligence had confirmed: outdoor wedding, untended buffet table, 9pm. <strong>The Riverside Crew</strong> — all eleven of them — arrived at 9:04pm. They took the shrimp cocktail. They took the fruit tower. <strong>One of them got into the wedding cake</strong> before being discovered. The cake survived. The raccoons were not invited back. They had not been invited in the first place.` },
  { emoji:'🏫🦝', title:'The Elementary School Lunch Heist',
    body:`<strong>Big Earl</strong> had been watching the outdoor lunch tables for months. On a Thursday in April he made his move — while 24 second-graders watched in stunned silence. He took two sandwiches, one bag of chips, and a juice box. <strong>He opened the juice box.</strong> He sat down and drank it. The children began cheering. <strong>Big Earl accepted the applause. Big Earl felt nothing.</strong>` },
  { emoji:'⛺🦝', title:'The Campground Catastrophe',
    body:`The campers had been warned. The warning said "secure all food." They did not secure the food. At 2am, <strong>a family of six raccoons</strong> dismantled the camp kitchen methodically. They assessed the marshmallows. <strong>They took everything except the kale chips.</strong> In the morning, a single kale chip had been placed in the center of their tent. A warning. Or a review.` },
  { emoji:'🌭🦝', title:'The Gas Station Hot Dog Job',
    body:`<strong>Terrence McBandito</strong> had studied the gas station layout for two weeks. On a Friday at 11pm he executed his plan. He got through the door. He made it to the hot dogs. <strong>He ate four and dropped one.</strong> The night attendant watched from behind the counter. The attendant did not move. <strong>They had an understanding.</strong>` },
  { emoji:'🦃🦝', title:'The Thanksgiving Aftermath',
    body:`Every raccoon within a four-block radius had been circling since noon. At 11:47pm, when the last light went off, <strong>Operation: Leftover Turkey</strong> began. Seventeen raccoons. The bag contained: a turkey carcass, mashed potato remnants, and half a can of cranberry sauce. <strong>The cranberry sauce caused a territorial dispute that lasted forty minutes.</strong> Nobody won the cranberry sauce. But nobody lost it either.` },
  { emoji:'🚚🦝', title:'The Food Truck Fiasco',
    body:`<strong>Consuela</strong> and her three associates had timed it perfectly — the taco truck on Elm Street, every Thursday at closing. This plan worked <strong>eleven Thursdays in a row.</strong> On the twelfth Thursday, the owner left out a paper bag of leftover carnitas specifically for Consuela. <strong>Consuela accepted. She left a bottle cap in return. It felt fair.</strong>` },
  { emoji:'🐶🦝', title:'The Dog Food Debacle',
    body:`The Peterson dog, <strong>Murray</strong>, never finished his dinner. <strong>Remy the Raccoon</strong> had known about this for years. Every night at 9pm, Remy finished Murray's dinner. Murray knew about Remy. Murray did not care. One night <strong>Remy and Murray shared the bowl simultaneously</strong> while Mrs. Peterson watched from the window in complete silence.` },
  { emoji:'🌮🦝', title:'Operation: Late Night Drive-Thru',
    body:`<strong>Detective Scraps McGee</strong> discovered the Taco Bell dumpster on Route 9 was unlocked on weeknights. For three months this was paradise. Then one night the dumpster was locked. Scraps sat next to it for forty minutes. <strong>A drive-thru employee brought him a bag of discarded chalupas.</strong> <strong>Scraps comes back every Tuesday.</strong> The employee always has a bag.` },
  { emoji:'🎂🦝', title:'The Backyard Birthday Party',
    body:`It was a child's seventh birthday. The cake was on a table outside. <strong>Nobody saw them come.</strong> When the birthday kid returned from the bounce house, the cake had one slice removed — clean, precise, as if cut with intention. The fork was placed neatly beside the plate. <strong>The surveillance camera showed three raccoons. One appeared to be wearing what witnesses described as "a proud expression."</strong>` },
  { emoji:'🍖🦝', title:'The Holiday Ham Incident',
    body:`The Kowalski family's holiday ham was cooling on the porch for exactly seven minutes. That was all <strong>Big Gustavo</strong> needed. He took a very large portion. He sat on the railing and ate it while they were inside. When Mr. Kowalski returned, Gustavo and the ham were gone. <strong>Only a single clove remained.</strong> Placed carefully on the railing. Like a business card.` },
  { emoji:'🚪🦝', title:'The Cat Door Infiltration',
    body:`The Hendersons installed a cat door. Their cat, <strong>Biscotti</strong>, used it four times before <strong>Marcus</strong> — a 22-pound raccoon — discovered it. Marcus fit through the cat door. This surprised everyone, including Marcus. He ate Biscotti's food, inspected the kitchen, took a cheese stick from the counter, and left. <strong>Biscotti watched the whole time from the couch. Biscotti said nothing.</strong>` },
  { emoji:'⛳🦝', title:'The Golf Course Snack Bar',
    body:`The Pinewood Golf Club snack bar near the 9th hole closed at sunset. <strong>The Fairway Crew</strong> — five raccoons of varying sizes — made their move on a Tuesday in June. They got the hot dogs, the candy bars, and a full bag of pretzels. One raccoon knocked over a display of golf tees. He picked them up. <strong>He stacked them neatly. He has standards.</strong>` },
];

const wisdoms = [
  { emoji:'🧠🦝', title:'"The trash will always provide."',
    body:`When life feels overwhelming, Joanne, remember: <strong>the trash will always provide.</strong> Did someone say something rude to you? There is a half-eaten sandwich within walking distance right now. <strong>The raccoon does not stress. The raccoon finds the sandwich.</strong> Be the raccoon, Joanne.` },
  { emoji:'🌙🦝', title:'"The night belongs to those who show up."',
    body:`Every raccoon philosopher agrees: <strong>show up at 3am, get the goods.</strong> The bin is full. The competition is asleep. This is a metaphor, Joanne. It is also literally what raccoons do. <strong>Both things are true. Both things are wisdom.</strong>` },
  { emoji:'✋🦝', title:'"Wash everything. Trust nothing."',
    body:`Before you consume anything — information, food, drama, opinions — <strong>wash it first.</strong> Examine it. Hold it up to the light. Then, and only then, eat it. Unless it's from a dumpster. Then just eat it. <strong>Life is short.</strong>` },
  { emoji:'👀🦝', title:'"The mask means nothing. The eyes see everything."',
    body:`Like a raccoon, Joanne, you see things others miss. You read a room like a raccoon reads a trash can — <strong>completely, thoroughly, and with great personal interest.</strong> This is a gift. A rare and powerful gift.` },
  { emoji:'🤝🦝', title:'"Work alone. But let your cousin come anyway."',
    body:`The greatest raccoon philosophers were solitary. But they always had <strong>a cousin who showed up uninvited.</strong> And somehow the cousin always helped. <strong>You cannot plan for the cousin. You simply accept the cousin. The cousin is part of the process.</strong>` },
  { emoji:'💅🦝', title:'"Do it boldly or do not do it at all."',
    body:`A raccoon has never done anything quietly. They tip the trash can at 3am and <strong>feel absolutely no shame about it.</strong> The raccoon does not apologize for wanting things. <strong>The raccoon tips the can and walks away unbothered.</strong>` },
  { emoji:'🍟🦝', title:'"Never apologize for your appetite."',
    body:`The raccoon has never once said sorry for being hungry. Not to the homeowner. Not to the dog. Not to the night security guard at the Kroger. <strong>Your hunger — for food, for joy, for more of whatever fills you up — is not something you owe anyone an explanation for.</strong> Eat the fries, Joanne. All of them.` },
  { emoji:'🗺️🦝', title:'"The best plans require no plan."',
    body:`Raccoons do not create five-year roadmaps. They see a gap in the fence, and they go through it. They smell something good, and they investigate. <strong>The raccoon's plan is simply: move toward the good thing.</strong> This has worked for 40 million years. It will work for you.` },
  { emoji:'🔒🦝', title:'"Every locked lid is just an unanswered question."',
    body:`The "raccoon-proof" lid is not a wall. It is an invitation to be creative. <strong>Every obstacle you face is asking you the same question:</strong> how badly do you want what's on the other side? The raccoon wants the garbage very badly. The raccoon finds a way. <strong>Be that determined about something, Joanne. Anything.</strong>` },
  { emoji:'🏋️🦝', title:'"No obstacle is too large for one who tips bins alone."',
    body:`A 96-gallon trash bin, full to the brim, weighs over 200 pounds. <strong>Raccoons tip them alone.</strong> Without a gym membership. Without a trainer. Without a protein shake. They simply want what's inside badly enough. <strong>This is the only motivation that has ever worked, for anyone, ever.</strong>` },
  { emoji:'🧘🦝', title:'"Sometimes you sit. Sometimes you wait. Both are wisdom."',
    body:`Not every night requires action. Sometimes <strong>the raccoon simply sits on the fence</strong> and watches the neighborhood. Takes stock. Breathes the night air. Eats a piece of bread it found somewhere. <strong>Stillness is not laziness. It is reconnaissance.</strong>` },
  { emoji:'🗑️🦝', title:'"Do not let anyone tell you a dumpster is beneath you."',
    body:`The raccoon has been told, many times, that its ambitions are garbage. <strong>The raccoon responds by eating the garbage.</strong> What others throw away, you can build something with. <strong>The raccoon sees value where the world sees waste. Be the raccoon.</strong>` },
  { emoji:'😤🦝', title:'"Act with confidence. Even wrong confidence is leadership."',
    body:`A raccoon has never once paused at a trash can thinking "maybe I shouldn't." It approaches with full conviction. It commits. <strong>Sometimes the trash can is empty. The raccoon simply moves to the next one.</strong> Confidence is not about being right. It is about moving forward with authority.` },
  { emoji:'🌅🦝', title:'"Find joy in the small things. A half-taco. A moment."',
    body:`The raccoon does not need a grand gesture to feel joy. A dropped french fry on an empty sidewalk. A recycling bin with a loose lid. The smell of someone grilling three streets over. <strong>Joy is not a destination, Joanne. It is a slightly open garbage bag at 2am.</strong> It is everywhere, if you look.` },
  { emoji:'🌒🦝', title:'"The 3am mind is the clearest mind."',
    body:`At 3am, everything unnecessary falls away. The noise, the opinions, the daylight obligations. <strong>What remains is the truest version of what you want.</strong> The raccoon has always known this. <strong>If you want to know what you really care about, ask yourself at 3am. Next to a trash can. Like a philosopher.</strong>` },
  { emoji:'⚔️🦝', title:'"Your enemies have trash cans too. Remember that."',
    body:`Whatever is standing between you and your goals: they have vulnerabilities. They have a loose lid somewhere. <strong>They have a side entrance that nobody thought to lock.</strong> The raccoon does not waste time on frontal assaults. It finds the soft spot. It waits. <strong>Then it takes the hot dogs.</strong>` },
  { emoji:'⏩🦝', title:'"A raccoon who hesitates goes to bed hungry."',
    body:`The porch light came on. The dog barked. The homeowner said "Hey!" <strong>None of these things stopped the raccoon.</strong> Hesitation is the only thing that has ever stopped a raccoon, and even then, only temporarily. <strong>When the lid is loose, you tip the can. You do not consider tipping the can. You tip it.</strong>` },
  { emoji:'🔄🦝', title:'"The lid that said no today will say yes tomorrow."',
    body:`Not every attempt succeeds. Some cans are truly sealed. Some dogs are truly awake and truly mean it. <strong>The raccoon accepts this and simply returns tomorrow night.</strong> Persistence is not desperation. It is the understanding that conditions change, and eventually <strong>someone leaves the lid slightly ajar and that's all you needed.</strong>` },
  { emoji:'🫂🦝', title:'"The strongest crews never planned to be a crew."',
    body:`Gerald didn't recruit Linda. Linda didn't recruit Lil' Diablo. They just all ended up at the same trash can at 2am and something clicked. <strong>The best teams find each other in the dark, behind the restaurant, when everyone else has gone home.</strong> Your people are out there, Joanne. They are also up late. They are also hungry.` },
  { emoji:'💎🦝', title:'"You are built for exactly this kind of chaos."',
    body:`Raccoons have survived ice ages, habitat loss, urbanization, and raccoon-proof containers. They have <strong>thrived</strong> in every environment humans have created. Whatever chaos you are currently navigating: <strong>you were built for this. Your ancestors tipped harder cans than this. Get in there.</strong>` },
];

const news = [
  { emoji:'📰🦝', title:'BREAKING: Local Raccoon "Just Checking" On Your Trash',
    body:`MESA, AZ — A raccoon identified as <strong>Gerald Bandito Williams</strong> was spotted at 2:47am conducting what sources describe as "just a quick look" at a residential trash can. Gerald stared at a reporter for eleven seconds before returning to the trash. <strong>"He didn't even take anything. He just checked. And left."</strong>` },
  { emoji:'🏆🦝', title:'RACCOON WINS STARING CONTEST WITH HOMEOWNER FOR THIRD CONSECUTIVE YEAR',
    body:`For the third year running, <strong>Duchess von Scraps</strong> has defeated homeowner Dave Kowalski in their 3am staring contest through the kitchen window. Dave tried a flashlight. Duchess was unimpressed. <strong>"She tilted her head. Like she pitied me."</strong> Dave has begun therapy. Duchess has not.` },
  { emoji:'🔬🦝', title:'SCIENTISTS CONFIRM: Raccoons Have Been "Judging Us This Whole Time"',
    body:`A new study confirms what many suspected: <strong>raccoons are absolutely judging us.</strong> "They know which houses put out good trash. They remember faces. They hold grudges." Lead consultant <strong>Professor Biscuit McTrash</strong> declined to comment but was seen taking notes near a recycling bin.` },
  { emoji:'📡🦝', title:'RACCOON SPENDS 45 MINUTES ON PORCH, ACCOMPLISHES NOTHING, LEAVES',
    body:`A raccoon visited a Mesa, AZ porch, ate one piece of cat food that was not hers, knocked over a plant, stared into the middle distance, and left. <strong>"She just needed a minute,"</strong> said one witness. <strong>"We all do sometimes."</strong> The plant is still on its side.` },
  { emoji:'🗳️🦝', title:'LOCAL RACCOON RUNS FOR HOA PRESIDENT ON "MORE TRASH" PLATFORM',
    body:`<strong>Councilwoman Griselda Dumpster-Hughes</strong> announced her HOA candidacy. Platform: more trash cans, looser lids, mandatory composting. Slogan: <strong>"You Already Lost. I'm Just Making It Official."</strong> She was unavailable for comment. She was going through someone's recycling.` },
  { emoji:'💔🦝', title:'AREA RACCOON VERY NORMAL ABOUT THE NEW "RACCOON-PROOF" LID',
    body:`Sources confirm <strong>Brendan Maurice Pawsworth III</strong> is being very normal about the raccoon-proof lid. "He just sits next to it. Every night." Brendan refuses to try the next block's trash can. <strong>"It's not about the food,"</strong> said one analyst. "It's about the principle."` },
  { emoji:'🎙️🦝', title:'RACCOON "NETWORKING" AT NEIGHBORHOOD BLOCK PARTY, SOURCES SAY',
    body:`A raccoon described as "extremely confident" attended the Sycamore Street block party uninvited. He sampled the potato salad, attended a conversation about property taxes, and took two sliders. <strong>Three attendees said they thought he was someone's dog.</strong> He was not someone's dog. <strong>He has been spotted at two subsequent neighborhood events.</strong>` },
  { emoji:'📊🦝', title:'RACCOON OPENS TRASH CONSULTING FIRM, BOOKS FILLING UP FAST',
    body:`<strong>Reginald P. Scrapsworth, MBA</strong> (Massive Bin Access) has launched "Scrapsworth & Associates." Services include: lid weakness assessment, optimal tipping angles, and dog-schedule mapping. <strong>His first three clients were raccoons. His fourth was a possum. His fifth was a crow who simply watched from a telephone pole.</strong>` },
  { emoji:'👟🦝', title:'SCIENTIST BAFFLED BY RACCOON WHO EXCLUSIVELY STEALS LEFT SHOES',
    body:`For 14 months, residents of Birch Lane have reported missing left shoes. Security footage confirms a single raccoon is responsible. He has never taken a right shoe. <strong>"We offered him a right shoe,"</strong> said one researcher. <strong>"He looked at it. He looked at us. He took the left shoe next to it and left."</strong>` },
  { emoji:'⭐🦝', title:'RACCOON LEAVES ONE-STAR YELP REVIEW OF NEIGHBORHOOD TRASH CANS',
    body:`A Yelp account belonging to <strong>"TrashCritique_Gerald"</strong> has left 47 reviews of residential trash cans. Common complaints: "lid too tight," "mostly cardboard, very disappointing." The Henderson bin on Maple Street received 5 stars. <strong>Gerald left the comment: "Consistent. They know what they're doing. Respect."</strong>` },
  { emoji:'📋🦝', title:'HOA UNABLE TO ENFORCE RACCOON RULES; RACCOON AWARE OF THIS',
    body:`The Pinewood Estates HOA voted 7-2 to institute a "no raccoon" policy in March. It is now November. The policy has not been enforced once. According to a neighbor, one raccoon — believed to be <strong>Councilwoman Griselda</strong> — attended the meeting from outside the window and watched the entire proceeding. <strong>She has not changed her behavior.</strong>` },
  { emoji:'😿🦝', title:'RACCOON SPOTTED COMFORTING STRAY CAT, REFUSING TO EXPLAIN WHY',
    body:`Witnesses on Fernwood Drive report seeing a large raccoon sitting beside a small stray cat near a storm drain at 1am Tuesday. The raccoon was not eating anything. <strong>The raccoon appeared to simply be present.</strong> The cat appeared calmer. After 20 minutes, the raccoon left. <strong>"It didn't make sense,"</strong> said one witness. <strong>"But it felt important."</strong>` },
  { emoji:'🤝🦝', title:'LOCAL MAN ATTEMPTS TO NEGOTIATE WITH RACCOON; RACCOON DOES NOT NEGOTIATE',
    body:`Dave Kowalski, 44, attempted to verbally negotiate with a raccoon over his recycling bin. He offered a separate bowl of food and a "designated raccoon corner." The raccoon, identified as <strong>Duchess</strong>, listened to the full proposal. <strong>She then tipped the entire bin. She made direct eye contact while doing it.</strong>` },
  { emoji:'💆🦝', title:'AREA RACCOON "GOING THROUGH SOME THINGS," SOURCES SAY',
    body:`Neighbors say <strong>Brendan</strong> has been "off" lately. He arrived at the Peterson trash can 40 minutes late. He knocked it over but didn't eat anything. He sat next to it for a while. He left. <strong>"He just sat there in the rain,"</strong> said one witness. <strong>"We've all been there."</strong> Brendan is fine. Probably.` },
  { emoji:'🗞️🦝', title:'RACCOON CAUGHT READING NEWSPAPER, DID NOT SUBSCRIBE',
    body:`A raccoon on Oak Street was observed Thursday morning sitting upright, holding a discarded newspaper, and appearing to read it. <strong>He held it correctly.</strong> He turned a page. He paused on what witnesses believe was the sports section. He then ate part of the newspaper. <strong>"He seemed disappointed,"</strong> said one observer. The Seahawks had lost.` },
  { emoji:'🍽️🦝', title:'RACCOON SEEN AT UPSCALE RESTAURANT, DID NOT HAVE RESERVATION',
    body:`Chez Marcel was visited Saturday by <strong>a raccoon of distinguished bearing.</strong> He entered through the patio, inspected two unattended appetizer plates, consumed a significant portion of the charcuterie board, and departed. <strong>"He had a presence,"</strong> said the maître d'. The raccoon left a napkin folded on the table. <strong>A good fold. Almost respectful.</strong>` },
  { emoji:'🏠🦝', title:"BREAKING: RACCOON HAS BEEN IN YOUR ATTIC 'THIS WHOLE TIME'",
    body:`A Mesa homeowner discovered Tuesday that a raccoon had been living in their attic for an estimated <strong>four to six months.</strong> The raccoon had created what inspectors described as "a surprisingly organized living space." There was a nest. There was a food cache. <strong>"It had a system,"</strong> said one inspector. <strong>"Better organized than my office, honestly."</strong>` },
  { emoji:'🏊🦝', title:'RACCOON USES BACKYARD POOL AS "PERSONAL WASHING STATION," HOMEOWNER LEARNS',
    body:`Footage revealed that <strong>Contessa LaRoux</strong> had been using the Garcias' pool between 1am and 3am every Tuesday and Thursday for three months. She washed food items. She washed her paws. On one occasion she appeared to float on her back. <strong>"She looked peaceful,"</strong> said Mrs. Garcia. <strong>"We didn't have the heart to stop her."</strong>` },
  { emoji:'🎭🦝', title:'RACCOON ACHIEVES "UNBOTHERED" ENERGY, EXPERTS SAY',
    body:`Behavioral scientists studying <strong>Montgomery T. Pawsworth</strong> say he represents a "pinnacle of unbothered energy rarely documented in nature." When sprayed with a hose: he waited until it stopped. When shouted at: he tilted his head. When a motion sensor light came on: he sat down. <strong>"He has fully transcended the concept of inconvenience,"</strong> said lead researcher Dr. Briggs.` },
  { emoji:'🌟🦝', title:'LOCAL RACCOON THROWS RETIREMENT PARTY USING YOUR TRASH',
    body:`Longtime neighborhood fixture <strong>Big Earl</strong>, estimated 6-7 years old, was observed at a gathering of approximately nine raccoons around the Miller trash cans. There was what appeared to be a structure made of paper cups. <strong>Big Earl sat in the center and received items one by one.</strong> "It looked like a ceremony," said Mrs. Miller. <strong>Big Earl was back the next night. He has not retired.</strong>` },
  { emoji:'📸🦝', title:'RACCOON PHOTOBOMBS FAMILY PORTRAIT, FAMILY KEEPS THE PHOTO',
    body:`The Williamson family hired a photographer for their annual holiday portrait. A raccoon — later identified as <strong>Francesca von Paws</strong> — appeared between Mr. and Mrs. Williamson in the background of every single shot, appearing to pose. <strong>"She was very still. Very intentional,"</strong> said the photographer. The family used the photo for their Christmas cards. <strong>Francesca received no credit.</strong>` },
];

// ══════════════════════════════════
// GALLERY SLIDESHOW
// ══════════════════════════════════
const galleryCaptions = [
  'The autumn crew has assembled.',
  'High-fives were exchanged. Business was conducted.',
  'Standing ovation for Big Earl.',
  'The night shift begins. The chaos is scheduled.',
  'Hunting for secrets. And also trash.',
];

let galleryIdx = 0;

function goToSlide(idx) {
  const slides = document.querySelectorAll('.gallery-slide');
  const dots   = document.querySelectorAll('.gdot');
  if (!slides.length) return;
  slides[galleryIdx].classList.remove('active');
  dots[galleryIdx].classList.remove('active');
  galleryIdx = ((idx % slides.length) + slides.length) % slides.length;
  slides[galleryIdx].classList.add('active');
  dots[galleryIdx].classList.add('active');
  const cap = document.getElementById('galleryCaption');
  if (cap) {
    cap.style.opacity = '0';
    setTimeout(() => {
      cap.textContent  = galleryCaptions[galleryIdx];
      cap.style.opacity = '1';
    }, 300);
  }
}

setInterval(() => goToSlide(galleryIdx + 1), 4200);

document.querySelectorAll('.gdot').forEach((dot, i) => {
  dot.addEventListener('click', () => goToSlide(i));
});

// ══════════════════════════════════
// SPECIAL EFFECTS
// ══════════════════════════════════

function lightningFlash() {
  const el = document.getElementById('lightningOverlay');
  el.classList.add('flash');
  setTimeout(() => { el.classList.remove('flash'); }, 90);
  setTimeout(() => { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 60); }, 160);
}

function screenShake() {
  document.body.classList.remove('screen-shaking');
  void document.body.offsetWidth;
  document.body.classList.add('screen-shaking');
  setTimeout(() => document.body.classList.remove('screen-shaking'), 400);
}

function confettiBurst(ox, oy, n) {
  const colors = ['#69BE28','#cc44ff','#ff69b4','#fff9f0','#ffdd00','#a8ff60','#00ccff','#ff8800'];
  const count  = n || 55;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 280;
    const dx    = Math.cos(angle) * speed;
    const dy    = Math.sin(angle) * speed - 180;
    const rot   = (Math.random() * 720 - 360) + 'deg';
    const dur   = (.7 + Math.random() * .7) + 's';
    piece.style.cssText = `
      left:${ox}px; top:${oy}px;
      width:${6 + Math.random() * 9}px;
      height:${6 + Math.random() * 9}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > .5 ? '50%' : '2px'};
      --cf-end:translate(${dx}px,${dy + 180}px);
      --cf-rot:${rot};
      --cf-dur:${dur};
      animation-delay:${(Math.random() * .08).toFixed(3)}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}

function glitchTitle() {
  const t = document.getElementById('siteTitle');
  t.classList.remove('glitching');
  void t.offsetWidth;
  t.classList.add('glitching');
  setTimeout(() => t.classList.remove('glitching'), 900);
}

function triggerParade() {
  const options = [
    '🦝 🦝 🦝 🦝 🦝',
    '🦝💜🦝💜🦝💜🦝',
    '🗑️🦝🗑️🦝🗑️🦝',
    '🦅🦝🦅🦝🦅🦝',
    '🦝✨🦝✨🦝✨🦝',
    '👑🦝👑🦝👑🦝',
    '🦝🎉🦝🎉🦝🎉🦝',
  ];
  const lanes = [28, 56, 84];
  const el    = document.createElement('div');
  el.className = 'parade-coon';
  el.textContent = options[Math.floor(Math.random() * options.length)];
  const dur = (4 + Math.random() * 3).toFixed(1);
  el.style.cssText = `bottom:${lanes[Math.floor(Math.random() * lanes.length)]}px; --pd-dur:${dur}s;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), (parseFloat(dur) + 1) * 1000);
}

function scheduleParade() {
  const delay = 18000 + Math.random() * 28000;
  setTimeout(() => { triggerParade(); scheduleParade(); }, delay);
}
scheduleParade();

// MILESTONES
const milestones = {
  5:    { emoji:'🦝',   title:'THE CHAOS HAS BEGUN!',           sub:'5 raccoons released. Gerald is warming up.' },
  10:   { emoji:'🗑️',   title:'TRASH CAN TIPPED!',              sub:'10 chaos events. The neighborhood is noticing.' },
  25:   { emoji:'💜',   title:'QUARTER CENTURY OF CHAOS!',       sub:'25 events. The raccoons have formed a committee.' },
  50:   { emoji:'🦅',   title:'SEAHAWKS APPROVED!',              sub:'50 events. Even the bird is impressed.' },
  100:  { emoji:'👑',   title:'RACCOON ROYALTY!',                sub:'100 events. You ARE the trash panda now.' },
  200:  { emoji:'🌌',   title:'CHAOS ASCENDANT!',                sub:"200 events. You've been elected Supreme Trash Monarch." },
  500:  { emoji:'💫🦝', title:'LEGENDARY TRASH STATUS!',         sub:'500 events. No human has ever gone this far.' },
  1000: { emoji:'🌠',   title:'TRANSCENDENT CHAOS DEITY!',       sub:'1000 events. The raccoons bow to you now.' },
};

function checkMilestone(n) {
  const m = milestones[n];
  if (!m) return;
  const banner = document.getElementById('milestoneBanner');
  document.getElementById('mbEmoji').textContent = m.emoji;
  document.getElementById('mbTitle').textContent = m.title;
  document.getElementById('mbSub').textContent   = m.sub;
  banner.classList.add('show');
  for (let i = 0; i < 4; i++) {
    setTimeout(() => confettiBurst(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight * .6,
      40
    ), i * 180);
  }
  triggerParade();
  glitchTitle();
  setTimeout(() => banner.classList.remove('show'), 3200);
}

// MOUSE SPARKLE TRAIL
let lastSparkle = 0;
const sparkleChars = ['✨','⭐','💫','🌟','✦','·','*'];
document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastSparkle < 75) return;
  lastSparkle = now;
  const el = document.createElement('div');
  el.className = 'sparkle';
  el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
  el.style.left = (e.clientX - 8) + 'px';
  el.style.top  = (e.clientY - 8) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
});

// ══════════════════════════════════
// GENERATE
// ══════════════════════════════════
function generate() {
  const btn  = document.getElementById('genBtn');
  const card = document.getElementById('outputCard');
  const r    = btn.getBoundingClientRect();

  btn.classList.remove('shaking');
  void btn.offsetWidth;
  btn.classList.add('shaking');

  if (soundOn) { try { playChitter(2); } catch(e){} }
  lightningFlash();
  screenShake();
  confettiBurst(r.left + r.width / 2, r.top + r.height / 2);

  const actual = currentMode === 'random'
    ? ['heist','advice','news'][Math.floor(Math.random() * 3)]
    : currentMode;

  const pools  = { heist: heists, advice: wisdoms, news };
  const labels = { heist:'🕵️ RACCOON HEIST REPORT', advice:'🧠 RACCOON WISDOM', news:'📰 BREAKING RACCOON NEWS' };
  const cls    = { heist:'heist-card', advice:'advice-card', news:'news-card' };

  const pool = pools[actual];
  let item;
  do { item = pool[Math.floor(Math.random() * pool.length)]; } while (item === lastItem && pool.length > 1);
  lastItem = item;

  const chaos       = Math.floor(Math.random() * 30) + 70;
  const isHighChaos = chaos >= 95;

  card.className = `output-card ${cls[actual]} new-card${isHighChaos ? ' high-chaos' : ''}`;
  card.innerHTML = `
    <div class="output-badge">${labels[actual]}</div>
    <span class="output-coon">${item.emoji}</span>
    <div class="output-title">${item.title}</div>
    <div class="output-body">${item.body}</div>
    <div class="chaos-meter">
      <div class="chaos-header"><span>CHAOS LEVEL</span><span id="chaosVal">0%</span></div>
      <div class="chaos-track"><div class="chaos-fill" id="chaosFill"></div></div>
    </div>
    <div class="card-actions">
      <button class="act-btn" onclick="copyStory()">📋 COPY</button>
      <button class="act-btn" onclick="generate()">🦝 ANOTHER ONE</button>
    </div>`;

  setTimeout(() => {
    const f = document.getElementById('chaosFill');
    const v = document.getElementById('chaosVal');
    if (f) f.style.width  = chaos + '%';
    if (v) v.textContent  = chaos + '%';
    if (isHighChaos) {
      setTimeout(() => {
        confettiBurst(window.innerWidth / 2, window.innerHeight * .4, 80);
        glitchTitle();
        if (Math.random() < .6) triggerParade();
      }, 900);
    }
  }, 80);

  count++;
  try { localStorage.setItem('joanneV4', count); } catch(e){}
  document.getElementById('counter').textContent = count;
  window._story = `${item.title}\n\n${item.body.replace(/<[^>]+>/g, '')}`;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });

  checkMilestone(count);
  if (Math.random() < .08) triggerParade();
  if (Math.random() < .18) setTimeout(glitchTitle, 400);
}

function copyStory() {
  if (!window._story) return;
  navigator.clipboard.writeText(window._story).then(() => {
    const b = document.querySelectorAll('.act-btn')[0];
    if (b) { b.textContent = '✓ COPIED!'; setTimeout(() => b.textContent = '📋 COPY', 2000); }
  }).catch(() => {});
}

// CLICK BURST
document.addEventListener('click', e => {
  if (e.target.closest('.gen-btn') || e.target.closest('.act-btn') || e.target.closest('.mode-btn') || e.target.closest('.gdot')) return;
  const items = ['🦝','💜','💚','💗','⭐','✨','🦅','🗑️'];
  const el = document.createElement('div');
  el.className = 'burst';
  el.textContent = items[Math.floor(Math.random() * items.length)];
  el.style.left = (e.clientX - 16) + 'px';
  el.style.top  = (e.clientY - 16) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 720);
});
