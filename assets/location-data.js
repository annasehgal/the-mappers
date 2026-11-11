// Positions are in original PNG pixels, never viewport coordinates.
// Room use is not inferred from room numbers; most rooms have no usage label.
export const entryDefinitions=[
 {id:'holt-entry-a',name:'Entry A · near Room 175',point:[1110,532],anchor:'e-se',accessibleExit:true,verification:'Wheelchair exit symbol in source plan; QR placement proposed.'},
 {id:'holt-entry-b',name:'Entry B · 171A / 170A side',point:[880,514],anchor:'e-ws',accessibleExit:false,verification:'Provisional checkpoint on corridor side of 171A. Installation position unverified.'},
 {id:'holt-entry-c',name:'Entry C · 171A / 157A side',point:[805,532],anchor:'c-door',accessibleExit:false,verification:'Approach to the double doorway at source pixel (805,522). Same-floor passage via short stairs confirmed by user. QR installation position remains proposed.'},
 {id:'holt-entry-d',name:'Entry D · near Room 125',point:[170,532],anchor:'w-sw',accessibleExit:true,verification:'Wheelchair exit symbol in source plan; QR placement proposed.'}
];
// id, label center, threshold, corridor anchor. Null thresholds remain searchable,
// but are never connected to the graph by proximity or by crossing another room.
export const roomDefinitions=[
 ['101',401,349,414,367,'w-101'],['101A',355,350],['101B',345,312],['101C',378,312],['101D',412,312],['101E',447,312],['101F',451,352],
 ['102',345,406,356,393,'w-102'],['104',310,406,323,393,'w-104'],['106',280,413,267,398,'w-106'],
 ['108',280,457,267,442,'w-108'],['110',280,500,267,512,'w-110'],['112',310,507,294,518,'w-112'],['114',345,507,364,518,'w-114'],
 ['116',379,500,390,514,'w-116'],['118',379,457],['120',379,411,390,398,'w-120'],
 ['111',290,331,289,367,'w-111'],['113',208,341,243,374,'w-113'],['115',230,405,243,388,'w-115'],
 ['117',230,443,243,438,'w-117'],['119',185,406],['121',185,453],['123',185,489,201,478,'w-123'],
 ['125',208,581,237,543,'w-125'],['125A',262,605],['127',263,570],['129',356,581,389,554,'w-129'],['129A',281,587],['129B',309,587],
 ['131',426,583],['131A',446,529],['131B',426,529],['133',435,409,414,398,'w-133'],
 ['135',510,328],['137',509,356],['139A',541,432],['141A',511,456],['141B',511,506],['141C',542,540],
 ['141',585,517],['142',687,410],['144',687,350,699,334,'m-144'],
 ['146',659,340,668,328,'m-146'],['148',628,340,613,328,'m-148'],['150',596,350,584,334,'m-150'],
 ['136',596,409,584,397,'m-136'],['138',628,442,614,455,'m-138'],['140',657,442],
 ['155',661,517,630,480,'m-141'],['157',755,500,723,463,'m-157'],['157A',775,431],['159',741,431],
 ['161',740,353,737,367,'m-161'],['163',634,290],['165',552,266,609,303,'m-165'],
 ['165A',545,327],['167',545,356],['169',706,261],
 ['170',963,450],['170A',900,455,892,487,'e-170a'],['170B',1020,416],['172',1019,502],
 ['171',871,581],['171A',845,532],
 ['173',964,581,997,543,'e-173'],['173A',1019,563],['175',1073,581,1025,543,'e-175'],['175A',1019,605],
 ['177',1101,488],['179',1072,452,1059,430,'e-179'],['181',1101,448,1087,422,'e-181'],
 ['183',1101,392,1087,417,'e-183'],['185',1068,333,1023,367,'e-185'],['185A',1072,382],
 ['187',973,333,938,367,'e-187'],['187A',919,350],['189',869,333,873,367,'e-189'],['189A',919,312]
];
export const poiDefinitions=[
 ['restroom-west-men','Men’s restroom · west','restroom',[436,450],[414,439],'w-men'],
 ['restroom-west-women','Women’s restroom · west','restroom',[436,487],[414,500],'w-women'],
 ['restroom-east-men','Men’s restroom · east','restroom',[846,452],[869,439],'e-men'],
 ['restroom-east-women','Women’s restroom · east','restroom',[846,486],[869,475],'e-women'],
 ['vending-east','Vending and phones','vending',[845,404],[869,422],'e-vending'],
 ['elevator','Elevator · middle wing','elevator',[772,355],[789,351],'m-elevator'],
 ['stairs-west','Stairs beside Room 123','stairs',[225,493],[235,515],'w-stairs'],
 ['stairs-east','Stairs beside Room 177','stairs',[1076,493],[1059,512],'e-stairs'],
 ['stairs-c','Stairs beside Entry C','stairs',[804,450],[805,470],'c-landing'],
 ['stairs-middle-west','Stairs between west and middle wings','stairs',[484,450],null,null],
 ['stairs-169','Stairs beside Room 163','stairs',[687,293],null,null]
];
