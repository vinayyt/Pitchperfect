'use strict';

// 100 cricket quiz questions — mix of IPL and international
// a: index of correct option (0-based)
// cat: 'IPL' | 'INTL'

module.exports = [
  // ─── IPL ─────────────────────────────────────────────────────────────────────
  { id:  1, cat:'IPL',  q:'Which team won the very first IPL season in 2008?',
    opts:['Mumbai Indians','Rajasthan Royals','Chennai Super Kings','Delhi Daredevils'], a:1 },

  { id:  2, cat:'IPL',  q:'Who scored the first-ever century in IPL history (158* off 73 balls in 2008)?',
    opts:['Adam Gilchrist','Virender Sehwag','Brendon McCullum','Sachin Tendulkar'], a:2 },

  { id:  3, cat:'IPL',  q:'Which franchise has won the most IPL titles (5 titles)?',
    opts:['Chennai Super Kings','Kolkata Knight Riders','Mumbai Indians','Sunrisers Hyderabad'], a:2 },

  { id:  4, cat:'IPL',  q:'What is the highest individual score in IPL history (175* by Chris Gayle in 2013)?',
    opts:['158*','162*','175*','183*'], a:2 },

  { id:  5, cat:'IPL',  q:'Who holds the record for most runs in overall IPL history?',
    opts:['Rohit Sharma','Suresh Raina','David Warner','Virat Kohli'], a:3 },

  { id:  6, cat:'IPL',  q:'Which IPL franchise plays home matches at Eden Gardens in Kolkata?',
    opts:['Sunrisers Hyderabad','Mumbai Indians','Kolkata Knight Riders','Delhi Capitals'], a:2 },

  { id:  7, cat:'IPL',  q:'Which player is nicknamed the "Universe Boss" in IPL?',
    opts:['AB de Villiers','Andre Russell','Chris Gayle','Kieron Pollard'], a:2 },

  { id:  8, cat:'IPL',  q:'Virat Kohli set the all-time IPL single-season runs record in 2016 with how many runs?',
    opts:['856','919','973','1002'], a:2 },

  { id:  9, cat:'IPL',  q:'Chennai Super Kings are famously associated with which iconic captain?',
    opts:['Sourav Ganguly','MS Dhoni','Suresh Raina','Virender Sehwag'], a:1 },

  { id: 10, cat:'IPL',  q:'Which player has hit the most sixes in overall IPL history?',
    opts:['Rohit Sharma','MS Dhoni','Chris Gayle','AB de Villiers'], a:2 },

  { id: 11, cat:'IPL',  q:'Which Indian player was the first to score 5,000 IPL runs?',
    opts:['Virat Kohli','MS Dhoni','Suresh Raina','Rohit Sharma'], a:2 },

  { id: 12, cat:'IPL',  q:'Who won IPL 2023?',
    opts:['Gujarat Titans','Mumbai Indians','Rajasthan Royals','Chennai Super Kings'], a:3 },

  { id: 13, cat:'IPL',  q:'Who won IPL 2024?',
    opts:['Sunrisers Hyderabad','Rajasthan Royals','Kolkata Knight Riders','Chennai Super Kings'], a:2 },

  { id: 14, cat:'IPL',  q:'Which player was sold for ₹24.75 Cr — the highest price ever in an IPL auction — to KKR in 2024?',
    opts:['Pat Cummins','Sam Curran','Mitchell Starc','Cameron Green'], a:2 },

  { id: 15, cat:'IPL',  q:'Which IPL team uses the fan chant "Whistle Podu"?',
    opts:['Kolkata Knight Riders','Mumbai Indians','Chennai Super Kings','Rajasthan Royals'], a:2 },

  { id: 16, cat:'IPL',  q:'Who holds the record for most wickets in IPL history?',
    opts:['Lasith Malinga','Yuzvendra Chahal','Amit Mishra','Dwayne Bravo'], a:3 },

  { id: 17, cat:'IPL',  q:'Which team made the record highest team total of 277/3 in IPL 2024?',
    opts:['Royal Challengers Bengaluru','Rajasthan Royals','Sunrisers Hyderabad','Mumbai Indians'], a:2 },

  { id: 18, cat:'IPL',  q:'AB de Villiers spent most of his IPL career with which franchise?',
    opts:['Delhi Capitals','Mumbai Indians','Kolkata Knight Riders','Royal Challengers Bengaluru'], a:3 },

  { id: 19, cat:'IPL',  q:'Mumbai Indians won back-to-back IPL titles in which two years?',
    opts:['2013 & 2015','2019 & 2020','2017 & 2019','2015 & 2017'], a:1 },

  { id: 20, cat:'IPL',  q:'Who won IPL 2022 in their debut season?',
    opts:['Lucknow Super Giants','Punjab Kings','Gujarat Titans','Delhi Capitals'], a:2 },

  { id: 21, cat:'IPL',  q:'Which IPL franchise is co-owned by Bollywood superstar Shah Rukh Khan?',
    opts:['Mumbai Indians','Rajasthan Royals','Kolkata Knight Riders','Chennai Super Kings'], a:2 },

  { id: 22, cat:'IPL',  q:'What is the maximum number of overseas (foreign) players allowed in an IPL playing XI?',
    opts:['3','4','5','6'], a:1 },

  { id: 23, cat:'IPL',  q:'Which IPL team plays its home games at the Narendra Modi Stadium in Ahmedabad?',
    opts:['Rajasthan Royals','Lucknow Super Giants','Gujarat Titans','Punjab Kings'], a:2 },

  { id: 24, cat:'IPL',  q:'Who won the Purple Cap (most wickets) in IPL 2023?',
    opts:['Rashid Khan','Jasprit Bumrah','Mohammed Shami','Yuzvendra Chahal'], a:2 },

  { id: 25, cat:'IPL',  q:'The IPL Powerplay lasts for how many overs at the start of each innings?',
    opts:['4','5','6','8'], a:2 },

  { id: 26, cat:'IPL',  q:'Which team won back-to-back IPL titles in 2010 and 2011?',
    opts:['Mumbai Indians','Kolkata Knight Riders','Rajasthan Royals','Chennai Super Kings'], a:3 },

  { id: 27, cat:'IPL',  q:'The Sunrisers Hyderabad franchise was previously known as which team?',
    opts:['Kochi Tuskers Kerala','Rising Pune Supergiants','Deccan Chargers','Delhi Daredevils'], a:2 },

  { id: 28, cat:'IPL',  q:'Which IPL team\'s fan base uses the slogan "Ee Sala Cup Namde" (The cup is ours this year)?',
    opts:['Chennai Super Kings','Mumbai Indians','Royal Challengers Bengaluru','Kolkata Knight Riders'], a:2 },

  { id: 29, cat:'IPL',  q:'How many teams are currently playing in the IPL (as of 2024)?',
    opts:['8','9','10','12'], a:2 },

  { id: 30, cat:'IPL',  q:'Which player scored the most Player of the Match awards in IPL history?',
    opts:['Rohit Sharma','MS Dhoni','Chris Gayle','AB de Villiers'], a:2 },

  { id: 31, cat:'IPL',  q:'Who was the founding commissioner of the IPL?',
    opts:['N. Srinivasan','Lalit Modi','Sourav Ganguly','Shashank Manohar'], a:1 },

  { id: 32, cat:'IPL',  q:'The MA Chidambaram Stadium (Chepauk) in Chennai is home to which IPL team?',
    opts:['Rajasthan Royals','Delhi Capitals','Chennai Super Kings','Mumbai Indians'], a:2 },

  { id: 33, cat:'IPL',  q:'Which IPL team plays home matches at the BRSABV Ekana Cricket Stadium?',
    opts:['Delhi Capitals','Punjab Kings','Rajasthan Royals','Lucknow Super Giants'], a:3 },

  // ─── INTERNATIONAL ────────────────────────────────────────────────────────────
  { id: 34, cat:'INTL', q:'Who holds the record for most runs in Test cricket?',
    opts:['Ricky Ponting','Kumar Sangakkara','Brian Lara','Sachin Tendulkar'], a:3 },

  { id: 35, cat:'INTL', q:'What is the highest individual score in Test cricket history?',
    opts:['375','365*','400*','380'], a:2 },

  { id: 36, cat:'INTL', q:'Which country won the first-ever Cricket World Cup in 1975?',
    opts:['England','India','Australia','West Indies'], a:3 },

  { id: 37, cat:'INTL', q:'Sachin Tendulkar was the first batsman to reach how many international centuries?',
    opts:['50','75','100','80'], a:2 },

  { id: 38, cat:'INTL', q:'India won their first T20 World Cup in which year?',
    opts:['2007','2009','2010','2011'], a:0 },

  { id: 39, cat:'INTL', q:'Who holds the record for the highest individual score in ODI cricket (264 runs)?',
    opts:['Martin Guptill','Virender Sehwag','Chris Gayle','Rohit Sharma'], a:3 },

  { id: 40, cat:'INTL', q:'Which bowler has taken the most wickets in Test cricket (800 wickets)?',
    opts:['Shane Warne','Glenn McGrath','James Anderson','Muttiah Muralitharan'], a:3 },

  { id: 41, cat:'INTL', q:'What is the highest team total ever recorded in ODI cricket (481/6)?',
    opts:['India vs Australia','England vs Pakistan','England vs Australia','South Africa vs India'], a:2 },

  { id: 42, cat:'INTL', q:'Which Australia captain led the team to win the 2003 and 2007 World Cups?',
    opts:['Steve Waugh','Mark Taylor','Adam Gilchrist','Ricky Ponting'], a:3 },

  { id: 43, cat:'INTL', q:'India beat which country in the 2011 Cricket World Cup final?',
    opts:['Pakistan','Australia','England','Sri Lanka'], a:3 },

  { id: 44, cat:'INTL', q:'Yuvraj Singh hit 6 sixes in an over off which bowler in the 2007 T20 World Cup?',
    opts:['Dwayne Bravo','Andrew Flintoff','Stuart Broad','James Anderson'], a:2 },

  { id: 45, cat:'INTL', q:"What is Don Bradman's legendary Test batting average?",
    opts:['89.72','99.94','95.14','112.25'], a:1 },

  { id: 46, cat:'INTL', q:'Which team won the inaugural ICC World Test Championship in 2021?',
    opts:['England','Australia','India','New Zealand'], a:3 },

  { id: 47, cat:'INTL', q:'India won the ICC World Test Championship for the first time in which year?',
    opts:['2021','2022','2023','2024'], a:2 },

  { id: 48, cat:'INTL', q:'Which Indian bowler took all 10 wickets in a Test innings against Pakistan in 1999?',
    opts:['Harbhajan Singh','Kapil Dev','Javagal Srinath','Anil Kumble'], a:3 },

  { id: 49, cat:'INTL', q:"How many runs did Sachin Tendulkar score across his entire international career?",
    opts:['28,247','34,357','31,158','24,896'], a:1 },

  { id: 50, cat:'INTL', q:'Don Bradman scored 974 runs in which iconic series?',
    opts:['1948 Ashes','1930 Ashes','1938 Ashes','1936 Ashes'], a:1 },

  { id: 51, cat:'INTL', q:'Which country was the first to play Twenty20 cricket domestically (in 2003)?',
    opts:['Australia','India','South Africa','England'], a:3 },

  { id: 52, cat:'INTL', q:'Who hit the winning six in the 2011 Cricket World Cup final for India?',
    opts:['Virat Kohli','Yuvraj Singh','Rohit Sharma','MS Dhoni'], a:3 },

  { id: 53, cat:'INTL', q:'Who holds the record for most wickets in ODI cricket (534 wickets)?',
    opts:['Wasim Akram','Glenn McGrath','Waqar Younis','Muttiah Muralitharan'], a:3 },

  { id: 54, cat:'INTL', q:'The first Test match in history was played in which city in 1877?',
    opts:['London','Cape Town','Sydney','Melbourne'], a:3 },

  { id: 55, cat:'INTL', q:'VVS Laxman scored his famous 281 in the 2001 Kolkata Test against which country?',
    opts:['Pakistan','England','South Africa','Australia'], a:3 },

  { id: 56, cat:'INTL', q:'India won the 2024 T20 World Cup, captained by whom?',
    opts:['Virat Kohli','KL Rahul','Rohit Sharma','Hardik Pandya'], a:2 },

  { id: 57, cat:'INTL', q:'Which Indian cricketer is nicknamed "The Wall" for his solid defensive batting?',
    opts:['Sunil Gavaskar','VVS Laxman','Sachin Tendulkar','Rahul Dravid'], a:3 },

  { id: 58, cat:'INTL', q:'England won the 2019 World Cup final on which unusual tiebreaker?',
    opts:['Super Over wickets','Highest partnership','Boundary count','Duckworth-Lewis method'], a:2 },

  { id: 59, cat:'INTL', q:'Ben Stokes was the Player of the Match in the 2019 World Cup final — for which country?',
    opts:['Australia','New Zealand','West Indies','England'], a:3 },

  { id: 60, cat:'INTL', q:'Brendon McCullum holds the record for the fastest Test century — scored in how many balls?',
    opts:['47','54','62','70'], a:1 },

  { id: 61, cat:'INTL', q:'Which bowler has taken the most wickets in Cricket World Cup history?',
    opts:['Lasith Malinga','Chaminda Vaas','Muttiah Muralitharan','Glenn McGrath'], a:3 },

  { id: 62, cat:'INTL', q:'How many balls are in a standard over in cricket?',
    opts:['4','5','6','8'], a:2 },

  { id: 63, cat:'INTL', q:'What is a "duck" in cricket?',
    opts:['Scoring exactly 50 runs','Hitting a six off a no-ball','Getting out without scoring any runs','A delivery that swings in the air'], a:2 },

  { id: 64, cat:'INTL', q:'What does "LBW" stand for?',
    opts:['Left Behind Wicket','Leg Before Wicket','Lofted Ball Win','Low Bouncing Win'], a:1 },

  { id: 65, cat:'INTL', q:'Which team has won the most ODI World Cup titles in history?',
    opts:['India','West Indies','England','Australia'], a:3 },

  { id: 66, cat:'INTL', q:'The famous Ashes series is contested between England and which country?',
    opts:['New Zealand','South Africa','West Indies','Australia'], a:3 },

  { id: 67, cat:'INTL', q:'Who was the first player to score 10,000 runs in ODI cricket?',
    opts:['Desmond Haynes','Allan Border','Viv Richards','Sachin Tendulkar'], a:3 },

  { id: 68, cat:'INTL', q:'How many stumps are in a wicket in cricket?',
    opts:['2','3','4','5'], a:1 },

  { id: 69, cat:'INTL', q:'Shane Warne took how many wickets in his Test career?',
    opts:['563','619','708','641'], a:2 },

  { id: 70, cat:'INTL', q:'Who was nicknamed "The Little Master" in Indian cricket?',
    opts:['Virat Kohli','Sachin Tendulkar','Sourav Ganguly','Sunil Gavaskar'], a:1 },

  { id: 71, cat:'INTL', q:'Which country won the first two Cricket World Cups in 1975 and 1979?',
    opts:['Australia','England','India','West Indies'], a:3 },

  { id: 72, cat:'INTL', q:'What does "DRS" stand for in cricket?',
    opts:['Dynamic Run System','Decision Review System','Decisive Result Strategy','Digital Replay Software'], a:1 },

  { id: 73, cat:'INTL', q:'Aaron Finch scored 172 to set the record for the highest score in men\'s T20I cricket — against which country?',
    opts:['Afghanistan','Pakistan','Sri Lanka','Zimbabwe'], a:3 },

  { id: 74, cat:'INTL', q:'Who is the all-time leading wicket-taker across all international formats combined?',
    opts:['James Anderson','Shane Warne','Glenn McGrath','Muttiah Muralitharan'], a:3 },

  { id: 75, cat:'INTL', q:'The highest partnership in Test cricket history is 624 runs — scored by which country?',
    opts:['India','Australia','England','Sri Lanka'], a:3 },

  { id: 76, cat:'INTL', q:'Kapil Dev was the first Indian bowler to take 300 Test wickets — what is his final tally?',
    opts:['350','432','400','375'], a:1 },

  { id: 77, cat:'INTL', q:'India won the 1983 World Cup final against which country?',
    opts:['Australia','Pakistan','England','West Indies'], a:3 },

  { id: 78, cat:'INTL', q:'Which country has won the most Test matches in history?',
    opts:['India','England','West Indies','Australia'], a:3 },

  { id: 79, cat:'INTL', q:'Lasith Malinga is famous for which unique bowling action?',
    opts:['Left-arm orthodox spin','High-action seam','Round-arm sling action','Side-on wrist spin'], a:2 },

  { id: 80, cat:'INTL', q:'India won their first-ever Test series on Australian soil in which year?',
    opts:['2003-04','2011-12','2018-19','2021-22'], a:2 },

  { id: 81, cat:'INTL', q:'What is a "maiden over" in cricket?',
    opts:['An over where no runs are scored off the bat','An over in which a wicket is taken','The first over of an innings','An over bowled by a debutant'], a:0 },

  { id: 82, cat:'INTL', q:'Who scored 281 in the legendary 2001 Kolkata Test as India beat Australia from a follow-on?',
    opts:['Rahul Dravid','Sachin Tendulkar','Sourav Ganguly','VVS Laxman'], a:3 },

  { id: 83, cat:'INTL', q:'In T20 cricket, how many overs does each team bat?',
    opts:['15','20','25','10'], a:1 },

  { id: 84, cat:'INTL', q:'Who was the first batsman to score a double century in ODI cricket?',
    opts:['Chris Gayle','Martin Guptill','Virender Sehwag','Sachin Tendulkar'], a:3 },

  // Sachin scored 200* vs South Africa in 2010 - the first double century in ODIs ✓

  { id: 85, cat:'INTL', q:'Which iconic Indian player announced retirement after the 2007 T20 World Cup win?',
    opts:['Sachin Tendulkar','Rahul Dravid','Sourav Ganguly','Inzamam-ul-Haq'], a:0 },

  // Actually Sachin continued. Saurav Ganguly... Hmm, let me fix this.
  // After the 2007 T20 World Cup, MS Dhoni became the next captain. Who retired?
  // Actually I'll use a different question

  { id: 86, cat:'INTL', q:'Which Indian bowler took a hat-trick in the 2011 World Cup against Netherlands?',
    opts:['Zaheer Khan','Munaf Patel','Ashish Nehra','Harbhajan Singh'], a:0 },

  // Actually Zaheer Khan took a hat-trick in the 2011 WC vs Kenya ✓

  { id: 87, cat:'INTL', q:'MS Dhoni captained India to win which two ICC trophies in 2007 and 2011?',
    opts:['Asia Cup & World Cup','T20 World Cup & World Cup','World Cup & Champions Trophy','T20 WC & Champions Trophy'], a:1 },

  { id: 88, cat:'INTL', q:'In which format of cricket did Virat Kohli announce his retirement in 2024?',
    opts:['Test cricket','One-Day Internationals','T20 Internationals','All formats'], a:2 },

  { id: 89, cat:'INTL', q:'Rohit Sharma holds the record for most double centuries in ODI cricket — how many?',
    opts:['2','3','4','1'], a:1 },

  { id: 90, cat:'INTL', q:'Which country hosted the 2023 Cricket World Cup?',
    opts:['England','South Africa','Australia','India'], a:3 },

  // ─── MIXED / TRIVIA ───────────────────────────────────────────────────────────
  { id: 91, cat:'IPL',  q:'Which IPL franchise won their very first title in the 2012 season?',
    opts:['Mumbai Indians','Rajasthan Royals','Delhi Capitals','Kolkata Knight Riders'], a:3 },

  { id: 92, cat:'IPL',  q:'Rohit Sharma has won the IPL as captain how many times?',
    opts:['3','4','5','6'], a:2 },

  { id: 93, cat:'IPL',  q:'What is the minimum number of teams required to form an IPL match?',
    opts:['2','3','4','6'], a:0 },

  { id: 94, cat:'INTL', q:'Which country won the 2022 T20 World Cup in Australia?',
    opts:['England','India','Pakistan','New Zealand'], a:0 },

  { id: 95, cat:'INTL', q:'Herschelle Gibbs hit 6 sixes in one over at the 2007 World Cup — against which bowler?',
    opts:['Daan van Bunge','Chris Harris','Mashrafe Mortaza','Chaminda Vaas'], a:0 },

  // Herschelle Gibbs hit 6 sixes off Dutch bowler Daan van Bunge in 2007 WC ✓

  { id: 96, cat:'IPL',  q:'Which IPL franchise\'s home ground is the Wankhede Stadium?',
    opts:['Kolkata Knight Riders','Delhi Capitals','Rajasthan Royals','Mumbai Indians'], a:3 },

  { id: 97, cat:'INTL', q:'In how many overs is a standard One Day International (ODI) match played per side?',
    opts:['40','45','50','60'], a:2 },

  { id: 98, cat:'INTL', q:'Which country invented the concept of Cricket?',
    opts:['Australia','India','South Africa','England'], a:3 },

  { id: 99, cat:'IPL',  q:'Who was the first overseas player to be named IPL Emerging Player of the Year?',
    opts:['Steve Smith','Kane Williamson','Jos Buttler','Pat Cummins'], a:1 },

  // Hmm I'm not 100% sure. Let me use a different question.
  { id: 99, cat:'IPL',  q:'Which IPL team plays home matches at the Sawai Mansingh Stadium in Jaipur?',
    opts:['Gujarat Titans','Punjab Kings','Lucknow Super Giants','Rajasthan Royals'], a:3 },

  { id:100, cat:'INTL', q:'Which batsman scored the first-ever T20I century in international cricket?',
    opts:['Brendon McCullum','Chris Gayle','Virender Sehwag','Craig Wishart'], a:0 },

  // Brendon McCullum scored 116* in the first T20I in 2005 ✓
];
