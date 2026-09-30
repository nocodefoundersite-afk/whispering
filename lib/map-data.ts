// Traced in the uploaded drawing's image coordinates, not redesigned positions.
// x increases rightwards; y increases downwards. One transform is used throughout.
export type Point = [number, number];
export type Feature = {id:string; name:string; kind:'building'|'canopy'|'pool'|'court'|'landscape'; category:string; points:Point[]; height:number; color:string; roof?:'hip'|'flat'; note:string; group?:string};
export const SOURCE={width:1888,height:1334,scale:.18,origin:[940,650] as Point,url:'/references/master-plan.webp',name:'MASTER PLAN WITH LANDSCAPE · 25TH AUG',revision:'R03'};
export const world=(p:Point):Point=>[(p[0]-SOURCE.origin[0])*SOURCE.scale,(p[1]-SOURCE.origin[1])*SOURCE.scale];
const rect=(x:number,y:number,w:number,h:number):Point[]=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
export const features:Feature[]=[];
function add(id:string,name:string,kind:Feature['kind'],category:string,points:Point[],height=3.4,color='#ece4d1',note='',roof:Feature['roof']='flat',group?:string){features.push({id,name,kind,category,points,height,color,roof,note,group});}
const traced='Footprint and position traced from the uploaded master plan. Vertical dimensions are illustrative because elevations are not supplied.';
add('parking','Four-wheeler parking','landscape','Arrival',[[171,183],[580,149],[606,376],[210,373],[177,339]],0,'#d6d9d1','Upper-left parking compound, with the long outer row, central double row and short western row retained.');
add('north-house-a','Upper pavilion · west','building','Above the road',[[618,172],[666,167],[668,209],[703,207],[704,165],[733,164],[740,327],[681,335],[679,345],[631,343]],3.7,'#e9e6d8',traced,'hip');
add('north-house-b','Upper pavilion · east','building','Above the road',[[800,156],[839,157],[839,173],[865,175],[866,162],[911,171],[906,208],[917,211],[910,278],[899,277],[892,330],[841,327],[841,341],[785,337]],3.7,'#e9e6d8',traced,'hip');
add('paintball','Paintball field','court','Sports precinct',[[989,156],[1117,164],[1127,178],[1110,355],[1100,365],[959,349]],0,'#758b4c','The large paintball field stays inside the left-hand ATV circuit.');
add('yoga','Yoga centre','building','Sports precinct',rect(1181,186,57,42),3.2,'#eee9d9',traced);
add('sauna','Sauna','building','Sports precinct',[[1149,229],[1176,230],[1174,305],[1145,304]],3.2,'#ead7b2',traced);
add('equipment','Paintball equipment','building','Sports precinct',[[1145,307],[1173,308],[1172,396],[1142,395]],3,'#e4dfd1',traced);
add('gym','Gym','building','Sports precinct',rect(1180,346,57,53),3.6,'#eae7da',traced);
add('changing-north','Changing · north','building','Sports precinct',[[1181,233],[1236,233],[1236,256],[1229,266],[1189,266],[1181,258]],3,'#e9e4d7',traced);
add('changing-south','Changing · south','building','Sports precinct',[[1181,313],[1188,307],[1227,307],[1235,315],[1235,342],[1181,342]],3,'#e9e4d7',traced);
add('sports-lounge','Sports arrival lounge','building','Sports precinct',rect(1244,343,57,33),3.1,'#e6decc',traced);
add('sports-counter','Sports counter','building','Sports precinct',rect(1245,184,60,21),3,'#e6decc',traced);
add('extra-space','Extra space','building','Sports precinct',[[1310,181],[1424,180],[1424,209],[1310,209]],3.2,'#e8e3d4','Labelled “EXTRA SPACE” in the plan. No additional programme has been assigned.');
add('padel','Padel court','court','Sports precinct',rect(1310,217,114,58),0,'#6986ac','Rectangular court retained above the two pickleball courts. The drawing shows 66′ × 33′; raster tracing is not a survey.');
add('pickleball-1','Pickleball · upper','court','Sports precinct',rect(1310,284,104,52),0,'#73936a','Upper of the two courts shown in the plan.');
add('pickleball-2','Pickleball · lower','court','Sports precinct',rect(1310,353,102,53),0,'#73936a','Lower of the two courts shown in the plan.');
add('east-building','Eastern activity & dining block','building','Sports precinct',[[1546,141],[1607,138],[1628,409],[1564,412],[1560,370],[1570,367],[1567,348],[1560,345],[1559,330],[1550,329]],3.4,'#d9dbbf','Long eastern block retained with its coloured activity bays, central passage, washrooms and dining zone. Small blurred labels are not treated as confirmed room names.');
add('east-service','Eastern annex','building','Sports precinct',[[1630,365],[1642,364],[1642,347],[1657,347],[1660,409],[1632,410]],2.9,'#c7c8d1',traced);
add('arrival','Circular arrival court','landscape','Day Club',[[758,429],[878,432],[874,457],[858,480],[834,491],[803,489],[778,476],[762,454]],0,'#666b69','The semicircular drop-off connects directly to the road, with its central planted island.');
add('reception','Reception pavilion','building','Day Club',[[773,497],[795,491],[818,492],[839,501],[845,515],[829,528],[798,531],[777,522]],3.4,'#e7dfc6','Small faceted reception below the circular arrival court; kept in its drawn position. Height and roof form are illustrative.','hip');
add('entry-kiosk','Entry / waiting pavilion','building','Day Club',[[660,449],[701,453],[696,510],[666,509]],3,'#e7dfc6',traced);
add('restaurant','Restaurant','building','Day Club',[[994,495],[1088,501],[1086,550],[992,543]],4.2,'#eae3cc','The restaurant occupies the upper-right corner of the Day Club loop, directly above the main pool. Its outline follows this map rather than the earlier rectangular study.');
add('club-house','Club house','building','Day Club',[[952,491],[994,495],[992,543],[949,541]],4,'#e8e0c9',traced);
add('kitchen','Kitchen & service rooms','building','Day Club',[[1044,551],[1091,552],[1091,552],[1122,551],[1123,600],[1092,599],[1092,637],[1065,637],[1065,612],[1044,612]],3.5,'#e8dfcb','Stepped service-room footprint beside the restaurant; the small SPA and changing-room boxes are retained.');
add('spa-rooms','Spa rooms','building','Day Club',[[1043,619],[1062,620],[1060,664],[1042,663]],3.1,'#e7dfd2','Two small SPA rooms indicated beside the open-kitchen area.');
add('main-pool','Main freeform pool','pool','Day Club',[[892,579],[904,571],[918,572],[934,578],[948,579],[968,574],[986,577],[1003,588],[1012,603],[1010,618],[1001,632],[987,638],[972,637],[957,631],[943,629],[929,633],[915,640],[905,638],[898,630],[896,615],[891,602],[888,589]],0,'#16b6c7','Freeform outline, curved bridge and internal pool furniture follow the map; water is shown in aqua-blue.');
const canopies:Point[][]=[[[679,547],[721,549],[719,591],[676,589]],[[690,594],[727,597],[724,636],[686,633]],[[760,560],[803,565],[799,607],[755,603]],[[805,578],[847,582],[844,622],[801,617]]];
canopies.forEach((p,i)=>add(`canopy-${i+1}`,`Yellow canopy · ${i+1}`,'canopy','Day Club',p,3.3,'#f0d628','One of the four yellow tensile canopies drawn to the left of the main pool.','flat','canopy'));
add('lower-pool','Lower accommodation pool','pool','Pool accommodation',[[719,764],[716,748],[721,732],[734,723],[748,720],[767,724],[788,724],[808,718],[827,710],[846,708],[864,710],[883,718],[902,729],[913,747],[920,763],[909,767],[903,755],[879,762],[879,781],[870,780],[857,750],[829,758],[835,774],[824,778],[806,742],[778,750],[784,765],[771,775],[755,740],[727,749],[733,764]],0,'#24becd','The long curved pool with four notched villa bays stays below the main pool.');
const lowerVillas:Point[][]=[[[733,758],[754,752],[768,788],[747,795]],[[784,761],[805,754],[819,792],[798,799]],[[834,770],[855,763],[870,801],[850,808]],[[883,776],[905,769],[920,804],[899,811]]];
lowerVillas.forEach((p,i)=>add(`pool-villa-${i+1}`,`Pool villa · ${i+1}`,'building','Pool accommodation',p,3.1,'#e8d8bf',traced,'hip','pool-villa'));
const westVillas:Point[][]=[[[682,682],[703,688],[694,719],[673,713]],[[673,713],[694,719],[685,750],[664,744]],[[664,744],[685,750],[676,781],[655,775]],[[755,666],[786,666],[785,689],[754,689]],[[786,666],[817,668],[817,691],[785,689]]];
westVillas.forEach((p,i)=>add(`west-suite-${i+1}`,`Poolside suite · ${i+1}`,'building','Pool accommodation',p,3.1,'#eadcc5',traced,'hip','west-suite'));
add('radial-pool','Angular courtyard pool','pool','Pool accommodation',[[949,706],[969,703],[976,721],[991,717],[1005,735],[1009,750],[992,751],[995,764],[1003,765],[1000,780],[976,788],[963,777],[952,764],[949,744],[940,731]],0,'#49bfd3','The distinct angular blue pool is retained inside the radial suite cluster.');
const radial:Point[][]=[[[915,686],[939,676],[946,704],[938,711],[931,728],[918,715]],[[941,675],[964,671],[977,675],[970,701],[948,705]],[[979,676],[1001,684],[991,716],[977,719],[970,702]],[[1004,686],[1024,702],[1035,728],[1012,737],[1007,716],[991,722]],[[1011,753],[1042,744],[1040,774],[1026,791],[1004,779],[1005,765]],[[1005,782],[1024,794],[1006,805],[979,811],[977,792]],[[949,778],[974,793],[978,811],[951,815],[941,800]],[[925,746],[943,742],[948,764],[955,776],[941,786],[928,774]]];
radial.forEach((p,i)=>add(`radial-suite-${i+1}`,`Courtyard wing · ${i+1}`,'building','Pool accommodation',p,3,'#e4d6c3','Visible wing outline around the angular pool. Wing divisions are traced; the blurred plan does not establish a room-count schedule.','flat','radial'));
const gardens:Point[][]=[[[1093,748],[1115,745],[1126,759],[1116,777],[1098,773],[1088,759]],[[1165,773],[1182,772],[1198,793],[1185,809],[1168,805],[1156,790]],[[1105,846],[1126,843],[1146,856],[1139,873],[1113,878],[1099,865]]];
gardens.forEach((p,i)=>add(`garden-pavilion-${i+1}`,`Garden pavilion · ${i+1}`,'building','Garden enclave',p,3.2,'#ede6d1',traced,'hip','garden'));
add('garden-lawn','Sculpted garden & lawn','landscape','Garden enclave',[[1081,717],[1195,717],[1214,837],[1248,865],[1261,1005],[1240,1037],[1098,1067],[1078,907],[1066,838],[1046,822]],0,'#8aa731','The three garden pavilions, branching paths, irregular lawn and southern paved terrace follow the lower-right garden.');
add('room-block','Paired accommodation block','building','Lower enclave',[[935,862],[1066,841],[1096,1062],[966,1092]],3.3,'#eee5cd','Long paired room block beside the garden, including its central circulation spine. The lower boundary is not replaced by a row of generic villas.');
const studios:Point[][]=[[[896,1174],[942,1165],[952,1215],[905,1225]],[[940,1153],[985,1144],[997,1194],[950,1204]],[[986,1132],[1033,1124],[1043,1175],[996,1185]]];
studios.forEach((p,i)=>add(`studio-${i+1}`,`Studio pair · ${i+1}`,'building','Lower enclave',p,3.3,'#eadbc0','One of the three paired studio footprints drawn beyond the lower boundary. Both halves are represented.','hip','studio'));
export const paths:{id:string;points:Point[];width:number;color:string;closed?:boolean; smooth?:boolean}[]=[
{id:'access-road',points:[[165,399],[280,396],[422,393],[521,393],[644,407],[807,412],[984,414],[1167,420],[1331,439],[1454,453],[1571,480],[1640,500],[1704,522]],width:33,color:'#666b6b'},
{id:'atv',points:[[934,357],[948,278],[970,165],[983,145],[1095,142],[1239,146],[1385,143],[1478,145],[1511,174],[1516,244],[1524,326],[1515,383],[1476,407],[1437,401],[1419,380],[1431,359],[1476,351],[1487,335],[1473,324],[1436,332],[1428,319],[1441,300],[1479,282],[1492,257],[1494,210],[1483,174],[1449,167],[1334,170],[1227,168],[1168,179],[1142,201],[1128,291],[1119,359],[1100,377],[1055,376],[971,366]],width:18,color:'#b59872',closed:true},
{id:'main-walk',points:[[679,521],[710,520],[751,536],[790,548],[825,548],[868,534],[899,505],[918,479],[953,458],[994,451],[1040,452],[1080,464],[1113,489],[1135,526],[1146,568],[1142,610],[1124,650],[1100,680],[1076,716],[1054,758],[1024,797],[993,819],[960,830],[916,833],[839,830],[758,821],[704,824],[660,817],[636,799],[628,770],[634,724],[645,679],[655,649],[654,626],[647,602],[649,567],[660,539]],width:13,color:'#aaa99b',closed:true},
{id:'middle-walk',points:[[652,626],[674,651],[706,658],[736,650],[768,642],[798,647],[826,661],[860,672],[892,674],[929,662],[966,653],[1003,658],[1034,680],[1068,716]],width:13,color:'#aaa99b'},
{id:'eastern-walk',points:[[1146,584],[1169,610],[1180,648],[1179,677],[1171,704],[1182,719],[1168,725],[1147,713],[1125,714],[1102,733]],width:12,color:'#aaa99b'},
{id:'arrival-walk',points:[[658,439],[655,482],[665,508],[674,520]],width:13,color:'#aaa99b'},
{id:'arrival-east',points:[[910,445],[900,459],[920,479]],width:12,color:'#aaa99b'},
{id:'garden-spine',points:[[1166,721],[1151,751],[1147,787],[1147,817],[1172,840]],width:9,color:'#b98242'},
{id:'garden-branch',points:[[1070,835],[1084,816],[1107,809],[1131,818],[1147,825]],width:8,color:'#b98242'},
{id:'garden-pavilion-path',points:[[1172,840],[1154,850],[1141,854]],width:6,color:'#b5b9a1'},
{id:'lower-access',points:[[933,1110],[1025,1087],[1121,1068],[1239,1045],[1274,1031]],width:16,color:'#d7cfb7'},
];
export const parcels: {points:Point[];color:string}[]=[
{points:[[170,181],[595,140],[688,127],[760,127],[977,125],[1126,125],[1150,131],[1174,127],[1465,122],[1653,73],[1682,447],[1708,492],[1594,467],[1473,441],[1290,423],[1105,395],[764,385],[589,375],[205,376]],color:'#ece9dc'},
{points:[[650,430],[1156,435],[1193,705],[1199,719],[1216,839],[1247,862],[1262,1004],[1245,1039],[1097,1069],[968,1094],[936,850],[609,826]],color:'#89ae49'},
{points:[[940,1097],[1053,1077],[1087,1238],[727,1285],[887,1152]],color:'#e4e4d3'}
];
export const corePaving:Point[]=[[662,439],[1152,442],[1180,703],[1080,714],[1048,775],[1009,817],[954,836],[646,810],[630,777]];
export const centralPlaza:Point[]=[[667,532],[728,530],[786,556],[838,553],[891,526],[928,488],[962,465],[1018,459],[1072,471],[1125,517],[1140,574],[1134,617],[1102,674],[1073,703],[1038,674],[1008,651],[962,645],[904,665],[870,663],[825,651],[781,635],[740,641],[706,651],[673,641],[655,609],[655,568]];
export const lowerPlaza:Point[]=[[667,674],[703,669],[748,653],[793,656],[828,674],[869,686],[891,705],[916,746],[932,806],[959,818],[888,824],[824,818],[754,810],[704,816],[659,805],[638,778],[643,736]];
export const lawnOutline:Point[]=[[1111,900],[1135,891],[1168,896],[1202,883],[1229,893],[1242,932],[1245,987],[1220,1007],[1134,1020],[1109,1006],[1102,969],[1106,929]];
export const byFeature=Object.fromEntries(features.map(f=>[f.id,f]));
