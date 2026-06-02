import React, { useState } from 'react';
import { 
  Crosshair, Shield, Map as MapIcon, Database, 
  Activity, Zap, Target, Users, FastForward,
  ChevronRight, Flag, Briefcase, Plus, AlertTriangle,
  Cloud, Flame, Award, Heart, BarChart2, ShieldAlert
} from 'lucide-react';

// --- НАСТРОЙКИ СЕТИ И ТОПОЛОГИИ КАРТЫ ---

const INITIAL_NODES = {
  // УКРАИНА (Базовый владелец: ukr)
  kyiv: { id: 'kyiv', name: 'Киев', x: 350, y: 220, terrain: 'urban', fort: 40, maxFort: 5, isMajor: true, vp: 50, owner: 'ukr', infrastructure: 100 },
  chernihiv: { id: 'chernihiv', name: 'Чернигов', x: 450, y: 140, terrain: 'forest', fort: 20, maxFort: 3, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  sumy: { id: 'sumy', name: 'Сумы', x: 600, y: 170, terrain: 'plains', fort: 10, maxFort: 3, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  kharkiv: { id: 'kharkiv', name: 'Харьков', x: 650, y: 270, terrain: 'urban', fort: 30, maxFort: 5, isMajor: true, vp: 20, owner: 'ukr', infrastructure: 100 },
  poltava: { id: 'poltava', name: 'Полтава', x: 530, y: 280, terrain: 'plains', fort: 10, maxFort: 3, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  donbas: { id: 'donbas', name: 'Донбасс', x: 740, y: 380, terrain: 'urban', fort: 80, maxFort: 5, isMajor: false, vp: 15, owner: 'ukr', infrastructure: 100 },
  dnipro: { id: 'dnipro', name: 'Днепр', x: 580, y: 380, terrain: 'urban', fort: 20, maxFort: 5, isMajor: true, vp: 20, owner: 'ukr', infrastructure: 100 },
  zaporizhzhia: { id: 'zaporizhzhia', name: 'Запорожье', x: 650, y: 450, terrain: 'plains', fort: 20, maxFort: 4, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  kherson: { id: 'kherson', name: 'Херсон', x: 520, y: 520, terrain: 'plains', fort: 10, maxFort: 3, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  odesa: { id: 'odesa', name: 'Одесса', x: 380, y: 520, terrain: 'urban', fort: 30, maxFort: 5, isMajor: true, vp: 20, owner: 'ukr', infrastructure: 100 },
  vinnytsia: { id: 'vinnytsia', name: 'Винница', x: 250, y: 320, terrain: 'forest', fort: 10, maxFort: 3, isMajor: false, vp: 10, owner: 'ukr', infrastructure: 100 },
  lviv: { id: 'lviv', name: 'Львов', x: 80, y: 250, terrain: 'urban', fort: 10, maxFort: 5, isMajor: true, vp: 30, owner: 'ukr', infrastructure: 100 },
  
  // ТОЧКИ ВТОРЖЕНИЯ РФ (Базовый владелец: rus, enemyCore: true)
  gomel: { id: 'gomel', name: 'Гомель', x: 350, y: 50, terrain: 'forest', fort: 0, maxFort: 0, isMajor: false, vp: 0, owner: 'rus', enemyCore: true, infrastructure: 100 },
  kursk: { id: 'kursk', name: 'Курск', x: 600, y: 50, terrain: 'plains', fort: 0, maxFort: 0, isMajor: false, vp: 0, owner: 'rus', enemyCore: true, infrastructure: 100 },
  belgorod: { id: 'belgorod', name: 'Белгород', x: 720, y: 150, terrain: 'urban', fort: 0, maxFort: 0, isMajor: false, vp: 0, owner: 'rus', enemyCore: true, infrastructure: 100 },
  rostov: { id: 'rostov', name: 'Ростов', x: 850, y: 380, terrain: 'urban', fort: 0, maxFort: 0, isMajor: false, vp: 0, owner: 'rus', enemyCore: true, infrastructure: 100 },
  crimea: { id: 'crimea', name: 'Крым', x: 550, y: 650, terrain: 'plains', fort: 50, maxFort: 0, isMajor: false, vp: 0, owner: 'rus', enemyCore: true, infrastructure: 100 },
};

const EDGES = [
  ['lviv', 'vinnytsia'], 
  ['vinnytsia', 'kyiv'], ['vinnytsia', 'odesa'],
  ['kyiv', 'chernihiv'], ['kyiv', 'poltava'], ['chernihiv', 'sumy'],
  ['sumy', 'kharkiv'], ['kharkiv', 'poltava'], ['kharkiv', 'donbas'],
  ['poltava', 'dnipro'], ['dnipro', 'donbas'], ['dnipro', 'zaporizhzhia'],
  ['zaporizhzhia', 'donbas'], ['zaporizhzhia', 'kherson'], ['kherson', 'odesa'],
  
  ['gomel', 'kyiv'], ['gomel', 'chernihiv'],
  ['kursk', 'sumy'],
  ['belgorod', 'kharkiv'],
  ['rostov', 'donbas'],
  ['crimea', 'kherson'], ['crimea', 'zaporizhzhia']
];

const UNIT_STATS = {
  inf: { softAtk: 16, hardAtk: 2, def: 28, width: 20, eqConsumption: 5, mpConsumption: 10 },
  tdf: { softAtk: 9, hardAtk: 1, def: 18, width: 20, eqConsumption: 2, mpConsumption: 5 },
  mech: { softAtk: 28, hardAtk: 18, def: 32, width: 20, eqConsumption: 15, mpConsumption: 8 },
  tank: { softAtk: 22, hardAtk: 35, def: 22, width: 20, eqConsumption: 25, mpConsumption: 6 },
  arty: { softAtk: 45, hardAtk: 12, def: 6, width: 10, eqConsumption: 30, mpConsumption: 5 }
};

const INITIAL_UNITS = [
  { id: 'u_72', name: '72-я ОМБр', faction: 'ukr', type: 'mech', location: 'kyiv', hp: 100, org: 100, exp: 40, general: 'sirsky', inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_1', name: '1-я ОТБр', faction: 'ukr', type: 'tank', location: 'chernihiv', hp: 100, org: 100, exp: 50, general: 'zaluzhny', inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_93', name: '93-я ОМБр', faction: 'ukr', type: 'mech', location: 'kharkiv', hp: 100, org: 100, exp: 65, general: 'sodol', inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_53', name: '53-я ОМБр', faction: 'ukr', type: 'mech', location: 'donbas', hp: 100, org: 100, exp: 55, general: 'naiev', inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_112', name: '112-я ОБрТрО', faction: 'ukr', type: 'tdf', location: 'kyiv', hp: 100, org: 100, exp: 10, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_55', name: '55-я ОАБр', faction: 'ukr', type: 'arty', location: 'zaporizhzhia', hp: 100, org: 100, exp: 45, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'u_80', name: '80-я ОДШБр', faction: 'ukr', type: 'inf', location: 'vinnytsia', hp: 100, org: 100, exp: 60, general: 'sirsky', inCombat: false, outOfSupplyDays: 0 },
  
  { id: 'r_1gta', name: '1-я Гв. Танковая', faction: 'rus', type: 'tank', location: 'belgorod', hp: 100, org: 100, exp: 30, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'r_20ca', name: '20-я Общевойсковая', faction: 'rus', type: 'mech', location: 'kursk', hp: 100, org: 100, exp: 25, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'r_vadv', name: '76-я ДШД', faction: 'rus', type: 'inf', location: 'gomel', hp: 100, org: 100, exp: 50, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'r_35ca', name: '35-я Армия', faction: 'rus', type: 'mech', location: 'gomel', hp: 100, org: 100, exp: 20, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'r_8ca', name: '8-я Армия', faction: 'rus', type: 'mech', location: 'rostov', hp: 100, org: 100, exp: 35, general: null, inCombat: false, outOfSupplyDays: 0 },
  { id: 'r_58ca', name: '58-я Армия', faction: 'rus', type: 'mech', location: 'crimea', hp: 100, org: 100, exp: 40, general: null, inCombat: false, outOfSupplyDays: 0 },
];

const GENERALS = {
  zaluzhny: { id: 'zaluzhny', name: 'ген. Залужный', bonusAtk: 1.15, bonusDef: 1.30, bonusOrgRegen: 1.25, desc: 'Железный Генерал: Огромный бонус защиты и восстановления сил.' },
  sirsky: { id: 'sirsky', name: 'ген. Сырский', bonusAtk: 1.30, bonusDef: 1.10, bonusOrgRegen: 1.15, desc: 'Снежный Барс: Превосходная атака, инициатива и прорыв.' },
  naiev: { id: 'naiev', name: 'ген. Наев', bonusAtk: 1.05, bonusDef: 1.35, bonusOrgRegen: 1.20, desc: 'Мастер фортификации: Повышает стойкость в оборонительных боях.' },
  sodol: { id: 'sodol', name: 'ген. Содоль', bonusAtk: 1.15, bonusDef: 1.15, bonusOrgRegen: 1.10, desc: 'Фронтовой командир: Эффективен при штурмах укрепрайонов.' }
};

const WEATHER_TYPES = ['Ясно', 'Дождь', 'Снег', 'Распутица'];

const HOI_THEME = {
  bg: '#1c1d1a',
  panel: '#252723',
  panelLighter: '#2d302b',
  border: '#101010',
  text: '#dcdcdc',
  accent: '#b89c50', 
  ukrBlue: '#1e3a8a',
  rusRed: '#7f1d1d'
};

const NATOSymbol = ({ type, faction, isSelected, onClick, inCombat }) => {
  const isUkr = faction === 'ukr';
  const fillColor = isUkr ? HOI_THEME.ukrBlue : HOI_THEME.rusRed;
  const strokeColor = isSelected ? HOI_THEME.accent : (isUkr ? '#3b82f6' : '#ef4444');
  
  return (
    <g onClick={onClick} className="cursor-pointer transition-transform hover:scale-110">
      {isUkr ? (
        <rect x="-15" y="-10" width="30" height="20" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
      ) : (
        <polygon points="0,-15 15,0 0,15 -15,0" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
      )}
      
      {(type === 'inf' || type === 'mech' || type === 'tdf') && <path d="M-15,-10 L15,10 M-15,10 L15,-10" stroke="#fff" strokeWidth="1.5" />}
      {type === 'mech' && <ellipse cx="0" cy="0" rx="6" ry="3" stroke="#fff" strokeWidth="1.5" fill="none" />}
      {type === 'tank' && <ellipse cx="0" cy="0" rx="8" ry="4" stroke="#fff" strokeWidth="1.5" fill="none" />}
      {type === 'arty' && <circle cx="0" cy="0" r="3" fill="#fff" />}
      {type === 'tdf' && <text x="0" y="8" fontSize="7" fill="#fff" textAnchor="middle" fontWeight="bold">T</text>}
      {inCombat && <circle cx="15" cy="-10" r="4" fill="#ef4444" className="animate-pulse" />}
    </g>
  );
};

export default function Game() {
  const [gameState, setGameState] = useState({
    day: 1,
    date: new Date(2022, 1, 24),
    pp: 80, 
    equipment: 6500, 
    manpower: 195000, 
    nationalWill: 90, 
    weather: 'Ясно',
    airForce: { ukr: 150, rus: 400, ukrAirSuperiority: 40, rusAirSuperiority: 60 },
    missiles: { ukr: 8, rus: 24 },
    nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
    units: JSON.parse(JSON.stringify(INITIAL_UNITS)),
    mobQueue: [],
    logs: ['=== НАЧАЛО КАМПАНИИ: СИСТЕМА ОНИКС ЗАПУЩЕНА ===\nУдарные группировки РФ пересекли государственную границу. Воздушная тревога во всех городах.'],
    activeOperation: null, 
  });

  const [uiState, setUiState] = useState({
    selectedNode: null,
    selectedUnit: null,
    orders: {}, 
    activeTab: 'map', 
  });

  const getUnitOrder = (id) => uiState.orders[id];

  const issueOrder = (unitId, targetId) => {
    const unit = gameState.units.find(u => u.id === unitId);
    if (!unit) return;
    
    if (unit.inCombat) {
      const isTargetEnemy = gameState.units.some(u => u.location === targetId && u.faction !== unit.faction);
      if (isTargetEnemy) {
        addLog(`[ШТАБ] ${unit.name} скован боестолкновением! Вы не можете атаковать смежную вражескую провинцию из боя.`);
        return;
      }
    }
    
    setUiState(prev => ({
      ...prev,
      orders: { ...prev.orders, [unitId]: targetId }
    }));
  };

  const addLog = (msg) => {
    setGameState(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 50)
    }));
  };

  const calculateSupplyOfNodes = (currentNodes) => {
    const supplySources = ['kyiv', 'lviv'];
    const suppliedNodes = new Set();
    const queue = [...supplySources];
    const visited = new Set(supplySources);

    while (queue.length > 0) {
      const currId = queue.shift();
      const node = currentNodes[currId];
      
      if (node && node.owner === 'ukr') {
        suppliedNodes.add(currId);
        
        EDGES.forEach(edge => {
          let neighborId = null;
          if (edge[0] === currId) neighborId = edge[1];
          else if (edge[1] === currId) neighborId = edge[0];

          if (neighborId && !visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }
    }
    return suppliedNodes;
  };

  const executeTurn = () => {
    let nextState = JSON.parse(JSON.stringify(gameState));
    let nextOrders = { ...uiState.orders };

    // ФИКС: Сначала генерируем погоду для НОВОГО хода
    const randWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    nextState.weather = randWeather;

    // Пишем её в заголовок лога — теперь ничего не опаздывает!
    let newLogs = [`\n=== ДЕНЬ ${nextState.day + 1} (${nextState.weather.toUpperCase()}) ===`];

    let weatherSpeedPenalty = 1;
    if (randWeather === 'Распутица') {
      weatherSpeedPenalty = 0.4;
      newLogs.push(`[ПОГОДА] На дорогах распутица! Скорость марша и пропускная способность снабжения снижены.`);
    } else if (randWeather === 'Дождь' || randWeather === 'Снег') {
      weatherSpeedPenalty = 0.7;
    }

    Object.keys(nextState.nodes).forEach(nodeId => {
      const node = nextState.nodes[nodeId];
      const nodeUnits = nextState.units.filter(u => u.location === nodeId);
      const ukrForces = nodeUnits.filter(u => u.faction === 'ukr');
      const rusForces = nodeUnits.filter(u => u.faction === 'rus');

      if (ukrForces.length > 0 && rusForces.length === 0) {
        if (node.owner !== 'ukr') {
          node.owner = 'ukr';
          nextState.nationalWill = Math.min(100, nextState.nationalWill + 3);
          newLogs.push(`[ОСВОБОЖДЕНИЕ] ВСУ вернули контроль над ${node.name}!`);
        }
      } else if (rusForces.length > 0 && ukrForces.length === 0) {
        if (node.owner !== 'rus') {
          node.owner = 'rus';
          nextState.nationalWill = Math.max(0, nextState.nationalWill - 4);
          newLogs.push(`[ОККУПАЦИЯ] Силы РФ заняли н.п. ${node.name}!`);
        }
      }
    });

    let factoryOutput = 0;
    const prodCenters = ['kyiv', 'lviv', 'dnipro', 'kharkiv'];
    prodCenters.forEach(city => {
      const node = nextState.nodes[city];
      if (node && node.owner === 'ukr') {
        const infraFactor = (node.infrastructure || 100) / 100;
        factoryOutput += Math.floor(250 * infraFactor);
      }
    });
    nextState.equipment += factoryOutput;
    nextState.pp += Math.floor(nextState.nationalWill * 0.1);

    nextState.missiles.ukr += 1;
    nextState.missiles.rus += 2;

    const suppliedUkrNodes = calculateSupplyOfNodes(nextState.nodes);

    nextState.units.forEach(unit => {
      const order = nextOrders[unit.id];
      
      if (order) {
        if (Math.random() <= weatherSpeedPenalty) {
          unit.location = order;
          newLogs.push(`[МАРШ] ${unit.name} передислоцировалась в ${INITIAL_NODES[order].name}.`);
          delete nextOrders[unit.id];
        } else {
          newLogs.push(`[МАРШ ЗАДЕРЖАН] Марш ${unit.name} приостановлен из-за плохих погодных условий.`);
        }
      }

      if (unit.faction === 'ukr') {
        const isSupplied = suppliedUkrNodes.has(unit.location);
        if (!isSupplied) {
          unit.outOfSupplyDays += 1;
          unit.org = Math.max(0, unit.org - 15 * unit.outOfSupplyDays);
          unit.hp = Math.max(5, unit.hp - 8 * unit.outOfSupplyDays);
          if (unit.outOfSupplyDays >= 2) {
             newLogs.push(`[ОКРУЖЕНИЕ] ${unit.name} в районе ${INITIAL_NODES[unit.location].name} заблокирована и лишена снабжения!`);
          }
        } else {
          unit.outOfSupplyDays = 0;
        }
      }

      if (!unit.inCombat && unit.outOfSupplyDays === 0) {
        let healMultiplier = unit.location === 'kyiv' || unit.location === 'lviv' ? 3 : 1;
        if (unit.hp < 100 && nextState.manpower > 1000 && nextState.equipment > 300) {
          unit.hp = Math.min(100, unit.hp + 5 * healMultiplier);
          nextState.manpower -= 500;
          nextState.equipment -= 100;
        }
        unit.org = Math.min(100, unit.org + 15 * healMultiplier);
      }
    });

    Object.keys(nextState.nodes).forEach(nodeId => {
      const node = nextState.nodes[nodeId];
      if (node.owner === 'rus' && !node.enemyCore) {
         const garrison = nextState.units.filter(u => u.location === nodeId && u.faction === 'rus');
         if (garrison.length === 0) {
            nextState.equipment = Math.max(0, nextState.equipment - 100);
            newLogs.push(`[ПАРТИЗАНЫ] Диверсионный рейд сопротивления в ${node.name}. Вражеские склады подорваны.`);
         }
      }
    });

    nextState.units.filter(u => u.faction === 'rus').forEach(ru => {
      if (ru.inCombat) return;

      const adjNodes = EDGES.filter(e => e[0] === ru.location || e[1] === ru.location)
                            .map(e => e[0] === ru.location ? e[1] : e[0]);

      let bestTarget = null;
      let maxVp = -1;
      adjNodes.forEach(nid => {
        const targetNode = nextState.nodes[nid];
        if (targetNode && targetNode.owner === 'ukr' && targetNode.vp > maxVp) {
          maxVp = targetNode.vp;
          bestTarget = nid;
        }
      });

      if (bestTarget) {
         ru.location = bestTarget;
         newLogs.push(`[ГЕНШТАБ РФ] Принято решение атаковать тактически важный центр ${nextState.nodes[bestTarget].name} (${maxVp} VP).`);
      } else {
         if (ru.location === 'gomel') ru.location = 'chernihiv';
         else if (ru.location === 'kursk') ru.location = 'sumy';
         else if (ru.location === 'belgorod') ru.location = 'kharkiv';
         else if (ru.location === 'rostov') ru.location = 'donbas';
         else if (ru.location === 'crimea') ru.location = 'kherson';
         else if (ru.location === 'sumy') ru.location = 'kharkiv';
         else if (ru.location === 'chernihiv') ru.location = 'kyiv';
      }
    });

    nextState.units.forEach(u => u.inCombat = false);

    Object.keys(nextState.nodes).forEach(nodeId => {
      const forces = nextState.units.filter(u => u.location === nodeId);
      const ukr = forces.filter(u => u.faction === 'ukr');
      const rus = forces.filter(u => u.faction === 'rus');

      if (ukr.length > 0 && rus.length > 0) {
        newLogs.push(`[БИТВА] Автоматическое сражение за контроль над ${INITIAL_NODES[nodeId].name}!`);
        forces.forEach(u => u.inCombat = true);

        const calcPower = (arr, isDefender) => arr.reduce((sum, u) => {
          const stats = UNIT_STATS[u.type];
          let pwr = (stats.softAtk + stats.hardAtk) * (u.hp / 100) * (u.org / 100);
          
          let expBonus = 1.0;
          if (u.exp > 80) expBonus = 1.4;
          else if (u.exp > 50) expBonus = 1.25;
          else if (u.exp > 25) expBonus = 1.1;
          pwr *= expBonus;

          if (u.general && GENERALS[u.general]) {
             pwr *= isDefender ? GENERALS[u.general].bonusDef : GENERALS[u.general].bonusAtk;
          }

          const airSup = nextState.airForce.ukrAirSuperiority;
          if (u.faction === 'ukr' && airSup > 50) pwr *= 1.15;
          
          if (isDefender) {
            pwr += stats.def;
            pwr *= (1 + nextState.nodes[nodeId].fort / 10);
            if (INITIAL_NODES[nodeId].terrain === 'urban') pwr *= 1.3;
          }
          return sum + pwr;
        }, 0);

        const isRusNative = INITIAL_NODES[nodeId].enemyCore;
        const ukrPower = calcPower(ukr, !isRusNative);
        const rusPower = calcPower(rus, isRusNative);
        
        const ukrRatio = ukrPower / (rusPower || 1);
        const rusRatio = rusPower / (ukrPower || 1);

        newLogs.push(`  Боевой потенциал: ВСУ ${Math.round(ukrPower)} | ВС РФ ${Math.round(rusPower)}`);

        if (ukrRatio < 0.33 && !isRusNative) {
           newLogs.push(`  [ОБОРОНА РФ] Позиции удержаны. Контрнаступление ВСУ захлебнулось.`);
           ukr.forEach(u => { u.org = Math.max(0, u.org - 30); u.hp = Math.max(10, u.hp - 10); });
        } else if (rusRatio < 0.33 && isRusNative) {
           newLogs.push(`  [ОБОРОНА ВСУ] Рубежи неприкосновенны. Массированная атака РФ отбита.`);
           rus.forEach(u => { u.org = Math.max(0, u.org - 30); u.hp = Math.max(10, u.hp - 10); });
        } else {
           ukr.forEach(u => {
             u.hp = Math.max(0, u.hp - (rusPower / (ukrPower||1)) * 6);
             u.org = Math.max(0, u.org - (rusPower / (ukrPower||1)) * 12);
             u.exp = Math.min(100, u.exp + 5);
           });
           rus.forEach(u => {
             u.hp = Math.max(0, u.hp - (ukrPower / (rusPower||1)) * 6);
             u.org = Math.max(0, u.org - (ukrPower / (rusPower||1)) * 12);
             u.exp = Math.min(100, u.exp + 5);
           });
        }

        nextState.units.forEach(u => {
          if (u.location === nodeId && u.org <= 20) {
            const adj = EDGES.filter(e => e[0] === nodeId || e[1] === nodeId)
                             .map(e => e[0] === nodeId ? e[1] : e[0]);
            const safeAdj = adj.filter(a => !nextState.units.some(enemy => enemy.location === a && enemy.faction !== u.faction));
            
            if (safeAdj.length > 0) {
              const retreatTarget = safeAdj[0];
              u.location = retreatTarget;
              u.org += 20;
              u.inCombat = false;
              newLogs.push(`  < ${u.name} отступила под давлением в ${INITIAL_NODES[retreatTarget].name}.`);
            } else {
              u.hp = 0;
              newLogs.push(`  ☠️ КОТЕЛ: ${u.name} полностью окружена и уничтожена в ${INITIAL_NODES[nodeId].name}!`);
              if (u.faction === 'rus') nextState.equipment += 1500;
              else nextState.nationalWill = Math.max(0, nextState.nationalWill - 10);
            }
          }
        });
      }
    });

    nextState.units = nextState.units.filter(u => u.hp > 0);

    const updatedQueue = [];
    nextState.mobQueue.forEach(job => {
      if (job.daysLeft <= 1) {
        nextState.units.push(job.unit);
        newLogs.push(`[РЕЗЕРВЫ] ${job.unit.name} введена в строй в ${INITIAL_NODES[job.unit.location].name}.`);
      } else {
        updatedQueue.push({ ...job, daysLeft: job.daysLeft - 1 });
      }
    });
    nextState.mobQueue = updatedQueue;

    if (Math.random() > 0.6) {
       const targets = ['kyiv', 'kharkiv', 'dnipro', 'lviv'];
       const strikeCity = targets[Math.floor(Math.random() * targets.length)];
       const cityNode = nextState.nodes[strikeCity];
       if (cityNode && cityNode.owner === 'ukr') {
          cityNode.infrastructure = Math.max(20, (cityNode.infrastructure || 100) - 25);
          newLogs.push(`[УДАР ВКС РФ] Ракетный налет повредил производственные мощности в г. ${cityNode.name}.`);
       }
    }

    nextState.day += 1;
    const nd = new Date(nextState.date);
    nd.setDate(nd.getDate() + 1);
    nextState.date = nd;
    
    nextState.logs = [...newLogs, ...nextState.logs].slice(0, 60);

    setGameState(nextState);
    setUiState(prev => ({ ...prev, orders: nextOrders }));
  };

  const calculateVP = () => {
    let ukrVp = 0;
    let rusVp = 0;
    Object.values(gameState.nodes).forEach(node => {
      if (node.vp > 0) {
        if (node.owner === 'ukr') ukrVp += node.vp;
        else rusVp += node.vp;
      }
    });
    return { ukrVp, rusVp };
  };

  const { ukrVp, rusVp } = calculateVP();

  const checkVictoryStatus = () => {
    if (rusVp >= 120) return 'defeat'; 
    if (gameState.nationalWill <= 0) return 'defeat';
    if (gameState.units.filter(u => u.faction === 'ukr').length === 0) return 'defeat';
    
    const activeRusseInUkr = gameState.units.some(
      u => u.faction === 'rus' && !INITIAL_NODES[u.location].enemyCore
    );

    const isMajorCitiesLiberated = 
      gameState.nodes.kyiv.owner === 'ukr' &&
      gameState.nodes.kharkiv.owner === 'ukr' &&
      gameState.nodes.donbas.owner === 'ukr' &&
      gameState.nodes.kherson.owner === 'ukr';

    if (gameState.day >= 7 && !activeRusseInUkr && isMajorCitiesLiberated) {
      return 'victory';
    }

    return 'active';
  };

  const gameStatus = checkVictoryStatus();

  const handleAssignGeneral = (unitId, genId) => {
    setGameState(prev => {
      const ns = { ...prev };
      const u = ns.units.find(un => un.id === unitId);
      if (u) u.general = genId;
      return ns;
    });
    addLog(`[ШТАБ] Назначен командующий подразделением.`);
  };

  const handleBuildFort = (nodeId) => {
    const node = gameState.nodes[nodeId];
    if (gameState.equipment < 1000) return alert('Недостаточно снаряжения (требуется 1000 Eq)!');
    if (node.fort >= node.maxFort * 20) return alert('Достигнут максимальный предел фортификационных сооружений!');

    setGameState(prev => {
      const ns = { ...prev };
      ns.equipment -= 1000;
      ns.nodes[nodeId].fort = Math.min(ns.nodes[nodeId].maxFort * 20, ns.nodes[nodeId].fort + 15);
      ns.logs = [`[ОБОРОНА] Завершены инженерные работы в районе ${node.name}. Возведен укрепрайон (+15% к защите).`, ...ns.logs];
      return ns;
    });
  };

  const handleMissileStrike = (targetId) => {
    if (gameState.missiles.ukr <= 0) return alert('Нет ракет для нанесения удара!');
    const node = gameState.nodes[targetId];

    setGameState(prev => {
      const ns = { ...prev };
      ns.missiles.ukr -= 1;
      ns.nodes[targetId].fort = Math.max(0, ns.nodes[targetId].fort - 15);
      const unitsInTarget = ns.units.filter(u => u.location === targetId && u.faction === 'rus');
      unitsInTarget.forEach(u => {
        u.hp = Math.max(10, u.hp - 15);
        u.org = Math.max(10, u.org - 25);
      });

      ns.logs = [`[РАКЕТНЫЙ УДАР] Нанесен высокоточный ракетный удар по передовым позициям противника в ${node.name}.`, ...ns.logs];
      return ns;
    });
  };

  const handleAirMission = (missionType) => {
    if (gameState.pp < 20) return alert('Недостаточно очков политики (требуется 20 PP)!');
    setGameState(prev => {
      const ns = { ...prev };
      ns.pp -= 20;
      if (missionType === 'sup') {
         ns.airForce.ukrAirSuperiority = Math.min(100, ns.airForce.ukrAirSuperiority + 15);
         ns.logs = [`[ВВС] Силы ВВС Украины перенаправлены на перехват и патрулирование.`, ...ns.logs];
      } else if (missionType === 'strike') {
         ns.units.filter(u => u.faction === 'rus').forEach(u => {
            if (Math.random() > 0.5) { u.hp = Math.max(10, u.hp - 15); u.org = Math.max(10, u.org - 20); }
         });
         ns.logs = [`[ВВС] Фронтовая авиация нанесла удары по коммуникациям снабжения наступающих колонн.`, ...ns.logs];
      }
      return ns;
    });
  };

  const handleRecruit = (type, days, eqCost, mpCost, nodeKey) => {
    if (gameState.equipment < eqCost) return alert('Недостаточно снаряжения!');
    if (gameState.manpower < mpCost) return alert('Недостаточно людей!');
    
    setGameState(prev => {
      const ns = {...prev};
      ns.equipment -= eqCost;
      ns.manpower -= mpCost;
      ns.mobQueue.push({
        daysLeft: days,
        unit: {
          id: `u_${Date.now()}`,
          name: `${Math.floor(Math.random()*100)+1} Бригада`,
          faction: 'ukr',
          type: type,
          location: nodeKey,
          hp: 100, org: 50, exp: 0, general: null, inCombat: false, outOfSupplyDays: 0
        }
      });
      ns.logs = [`[ШТАБ] Начат процесс формирования подразделения в ${INITIAL_NODES[nodeKey].name} (${days} дн.)`, ...ns.logs];
      return ns;
    });
  };

  const handlePolicy = (id) => {
    if (gameState.pp < 50) return alert('Нужно 50 PP!');
    setGameState(prev => {
      const ns = {...prev};
      ns.pp -= 50;
      if (id === 'mob') {
        ns.manpower += 100000;
        ns.nationalWill = Math.min(100, ns.nationalWill + 5);
        ns.logs = ['[ПОЛИТИКА] Объявлена волна мобилизации. Пул пополнен на 100к человек.', ...ns.logs];
      }
      if (id === 'lendlease') {
        ns.equipment += 5000;
        ns.logs = ['[ПОЛИТИКА] Поставки Ленд-Лиза разгружены на хабах. Получено +5000 снаряжения.', ...ns.logs];
      }
      if (id === 'ew') {
         ns.units.filter(u => u.faction === 'rus').forEach(u => u.org = Math.max(10, u.org - 25));
         ns.logs = ['[ПОЛИТИКА] Комплексная кибератака и РЭБ снизили управляемость войск противника.', ...ns.logs];
      }
      return ns;
    });
  };

  const getExpLevel = (exp) => {
    if (exp > 80) return 'Элита';
    if (exp > 50) return 'Ветераны';
    if (exp > 25) return 'Опытные';
    return 'Новобранцы';
  };

  const renderMap = () => {
    const suppliedNodes = calculateSupplyOfNodes(gameState.nodes);
    
    return (
      <div className="relative w-full flex-grow bg-[#1a1c18] border-b-2 border-black overflow-auto shadow-inner flex items-center justify-center min-h-0">
        <svg width="900" height="700" viewBox="0 0 900 700" className="select-none shrink-0">
          <path 
            d="M -10,90 Q 300,90 500,100 T 680,180 T 720,400 Q 750,500 800,700" 
            stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" strokeDasharray="12,8" fill="none" 
          />
          <path 
            d="M 450,620 Q 550,600 650,620" 
            stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" strokeDasharray="12,8" fill="none" 
          />

          <text x="250" y="50" fill="rgba(239, 68, 68, 0.2)" fontSize="24" fontWeight="bold" letterSpacing="8" transform="rotate(-5 250 50)">БЕЛАРУСЬ</text>
          <text x="750" y="80" fill="rgba(239, 68, 68, 0.2)" fontSize="24" fontWeight="bold" letterSpacing="8" transform="rotate(25 750 80)">РОССИЯ</text>

          {EDGES.map((edge, idx) => {
            const n1 = gameState.nodes[edge[0]];
            const n2 = gameState.nodes[edge[1]];
            const hasSupply = suppliedNodes.has(edge[0]) && suppliedNodes.has(edge[1]);
            return (
              <line 
                key={idx} 
                x1={n1.x} y1={n1.y} 
                x2={n2.x} y2={n2.y} 
                stroke={hasSupply ? "#3b82f6" : "#475569"} 
                strokeWidth={hasSupply ? "3" : "1.5"} 
                strokeDasharray="4,4" 
              />
            );
          })}

          {Object.values(gameState.nodes).map(node => {
             const isSelected = uiState.selectedNode?.id === node.id;
             const isSupplied = suppliedNodes.has(node.id);
             const borderGlow = node.owner === 'ukr' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)';

             return (
               <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onClick={() => setUiState({...uiState, selectedNode: node, selectedUnit: null})} className="cursor-pointer">
                 <circle r="22" fill="none" stroke={borderGlow} strokeWidth="2" strokeDasharray="3,3" />
                 <circle r={isSelected ? "14" : "10"} fill="#1e293b" stroke={isSelected ? HOI_THEME.accent : (node.owner === 'ukr' ? '#1e3a8a' : '#7f1d1d')} strokeWidth="2.5" />
                 {node.vp > 0 && <circle r="4" cy="-14" fill={HOI_THEME.accent} />}
                 {node.owner === 'ukr' && !isSupplied && <path d="M-5,-16 L5,-16 L0,-24 Z" fill="#f59e0b" />}
                 <text y="28" textAnchor="middle" fill={isSelected ? HOI_THEME.accent : "#94a3b8"} className="text-[9px] font-bold font-mono bg-black" style={{ textShadow: '1px 1px 2px black' }}>
                   {node.name.toUpperCase()}
                 </text>
               </g>
             );
          })}

          {Object.values(gameState.nodes).map(node => {
            const nodeUnits = gameState.units.filter(u => u.location === node.id);
            return nodeUnits.map((unit, idx) => {
               const angle = (idx / nodeUnits.length) * Math.PI * 2;
               const radius = nodeUnits.length > 1 ? 25 : 0;
               const ox = Math.cos(angle) * radius;
               const oy = Math.sin(angle) * radius;
               const isSelected = uiState.selectedUnit?.id === unit.id;
               const order = getUnitOrder(unit.id);

               return (
                 <g key={unit.id} transform={`translate(${node.x + ox}, ${node.y + oy})`}>
                   <NATOSymbol 
                     type={unit.type} faction={unit.faction} inCombat={unit.inCombat}
                     isSelected={isSelected} 
                     onClick={(e) => { e.stopPropagation(); setUiState({...uiState, selectedUnit: unit, selectedNode: node}); }}
                   />
                   {order && (
                      <line 
                        x1={0} y1={0} 
                        x2={INITIAL_NODES[order].x - (node.x + ox)} 
                        y2={INITIAL_NODES[order].y - (node.y + oy)} 
                        stroke={HOI_THEME.accent} strokeWidth="2" strokeDasharray="4,4" opacity="0.6"
                      />
                   )}
                 </g>
               );
            });
          })}
        </svg>
      </div>
    );
  };

  if (gameStatus !== 'active') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
         <div className="max-w-xl text-center bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl">
            <h1 className={`text-5xl font-black mb-6 ${gameStatus === 'victory' ? 'text-green-500' : 'text-red-600'}`}>
              {gameStatus === 'victory' ? 'ПОБЕДА УКРАИНЫ' : 'КАМПАНИЯ ПРОВАЛЕНА'}
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {gameStatus === 'victory' 
                 ? 'Организованные силы вторжения противника полностью уничтожены или отброшены за государственную границу Украины. Суверенитет восстановлен.' 
                 : 'Критическое количество победных очков потеряно. Стратегические резервы исчерпаны. Генеральный штаб прекратил работу.'}
            </p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded font-black uppercase transition-colors">
               Перезапустить
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen font-sans flex flex-col select-none overflow-hidden" style={{ backgroundColor: HOI_THEME.bg, color: HOI_THEME.text }}>
      
      {/* TOPBAR */}
      <div className="h-14 min-h-[3.5rem] flex items-center px-4 shadow-md z-10 shrink-0" style={{ backgroundColor: HOI_THEME.panel, borderColor: HOI_THEME.border, borderBottomWidth: '2px' }}>
        <div className="w-12 h-10 border flex items-center justify-center font-bold text-lg mr-6 shadow-inner" style={{ backgroundColor: HOI_THEME.panelLighter, borderColor: HOI_THEME.border, color: HOI_THEME.accent }}>
           UA
        </div>
        <div className="flex gap-8 text-xs font-bold tracking-wide items-center">
           <div className="flex items-center gap-1.5" title="Политическая власть (PP)">
             <Flag className="text-gray-400" size={14}/> {gameState.pp}
           </div>
           <div className="flex items-center gap-1.5" title="Снаряжение">
             <Database className="text-blue-400" size={14}/> {gameState.equipment.toLocaleString()}
           </div>
           <div className="flex items-center gap-1.5" title="Людские резервы">
             <Users className="text-green-500" size={14}/> {(gameState.manpower / 1000).toFixed(1)}k
           </div>
           <div className="flex items-center gap-1.5" title="Национальная воля">
             <Heart className="text-red-500" size={14}/> {gameState.nationalWill}%
           </div>
           <div className="flex items-center gap-1.5 text-blue-300" title="Наши Victory Points">
             <Award size={14}/> {ukrVp} / 155 VP
           </div>
           <div className="flex items-center gap-1.5" title="Погода">
             <Cloud className="text-sky-400" size={14}/> {gameState.weather}
           </div>
        </div>
        <div className="ml-auto flex items-center gap-6">
           <span className="font-mono font-bold text-amber-500 text-base tracking-widest">{gameState.date.toLocaleDateString('ru-RU')}</span>
           <button onClick={executeTurn} className="px-6 py-2 bg-[#3e413c] hover:bg-[#4a4d46] border border-black shadow-[0_0_8px_rgba(0,0,0,0.6)] flex items-center gap-2 font-black uppercase text-amber-500 transition-colors">
             <FastForward size={18}/> След. Ход
           </button>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ (ФУЛЛСКРИН СЕТКА) */}
      <div className="flex flex-row flex-grow h-0 overflow-hidden w-full">
        
        {/* ЛЕВАЯ ПАНЕЛЬ: СПИСОК ВОЙСК */}
        <div className="w-64 border-r-2 flex flex-col h-full shrink-0" style={{ backgroundColor: HOI_THEME.panel, borderColor: HOI_THEME.border }}>
          <div className="p-3 text-xs font-bold uppercase tracking-widest border-b flex justify-between shrink-0" style={{ borderColor: HOI_THEME.border, backgroundColor: HOI_THEME.panelLighter }}>
             <span>Сухопутные силы</span>
             <span className="text-blue-400 font-mono">x{gameState.units.filter(u => u.faction === 'ukr').length}</span>
          </div>
          <div className="flex-grow overflow-y-auto p-2 space-y-1 bg-[#151613]">
             {gameState.units.filter(u => u.faction === 'ukr').map(u => (
                <div key={u.id} 
                     onClick={() => setUiState({...uiState, selectedUnit: u, selectedNode: gameState.nodes[u.location]})}
                     className={`p-2 text-xs flex justify-between items-center cursor-pointer border ${uiState.selectedUnit?.id === u.id ? 'border-amber-500 bg-amber-900/20' : 'border-[#333] hover:border-gray-500 bg-[#1a1b18]'}`}>
                   <div>
                     <span className="font-bold block text-[#eee]">{u.name}</span>
                     {u.general && <span className="text-[9px] text-amber-500">{GENERALS[u.general].name}</span>}
                   </div>
                   <div className="text-right">
                     <span className="text-gray-400 block font-mono">HP: {Math.round(u.hp)}%</span>
                     <span className="text-green-500 text-[10px] font-mono">Org: {Math.round(u.org)}%</span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* ЦЕНТР: КАРТА И ЛОГИ */}
        <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex gap-1 p-2 shrink-0" style={{ backgroundColor: HOI_THEME.panel }}>
             <button onClick={() => setUiState({...uiState, activeTab: 'map'})} className={`px-4 py-1 text-xs font-bold uppercase border ${uiState.activeTab==='map' ? 'bg-[#3e413c] text-white border-gray-500' : 'bg-[#1a1b18] text-gray-500 border-black'}`}>Карта ТВД</button>
             <button onClick={() => setUiState({...uiState, activeTab: 'politics'})} className={`px-4 py-1 text-xs font-bold uppercase border ${uiState.activeTab==='politics' ? 'bg-[#3e413c] text-white border-gray-500' : 'bg-[#1a1b18] text-gray-500 border-black'}`}>Штаб / Решения</button>
             <button onClick={() => setUiState({...uiState, activeTab: 'air'})} className={`px-4 py-1 text-xs font-bold uppercase border ${uiState.activeTab==='air' ? 'bg-[#3e413c] text-white border-gray-500' : 'bg-[#1a1b18] text-gray-500 border-black'}`}>ВВС & ПВО</button>
          </div>

          {uiState.activeTab === 'map' ? (
            <>
              {renderMap()}
              <div className="h-48 min-h-[12rem] p-3 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner shrink-0" style={{ backgroundColor: '#0a0a0a', borderColor: HOI_THEME.border, color: '#4ade80' }}>
                 {gameState.logs.map((log, i) => <pre key={i} className="whitespace-pre-wrap opacity-90">{log}</pre>)}
              </div>
            </>
          ) : uiState.activeTab === 'politics' ? (
            <div className="flex-grow p-8 overflow-y-auto" style={{ backgroundColor: HOI_THEME.bg }}>
               <h2 className="text-2xl font-bold text-amber-500 mb-6 uppercase border-b border-gray-700 pb-2">Решения Кабинета Министров</h2>
               <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => handlePolicy('mob')} className="p-4 bg-[#252723] hover:bg-[#2d302b] border border-gray-700 text-left transition-colors">
                     <h3 className="text-lg font-bold text-white mb-2">Общая мобилизация (50 PP)</h3>
                     <p className="text-xs text-gray-400">Призвать дополнительные 100,000 резервистов в людской пул для пополнения потерь.</p>
                  </button>
                  <button onClick={() => handlePolicy('lendlease')} className="p-4 bg-[#252723] hover:bg-[#2d302b] border border-gray-700 text-left transition-colors">
                     <h3 className="text-lg font-bold text-white mb-2">Активировать Ленд-Лиза (50 PP)</h3>
                     <p className="text-xs text-gray-400">Принять западную военную технику. Получить +5000 единиц снаряжения на хабах во Львове.</p>
                  </button>
                  <button onClick={() => handlePolicy('ew')} className="p-4 bg-[#252723] hover:bg-[#2d302b] border border-gray-700 text-left transition-colors">
                     <h3 className="text-lg font-bold text-white mb-2">Наступательная ... РЭБ (50 PP)</h3>
                     <p className="text-xs text-gray-400">Масштабная радиоэлектронная атака на штабы РФ. Понизить организацию всех вражеских войск на 25% на текущий ход.</p>
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex-grow p-8 overflow-y-auto" style={{ backgroundColor: HOI_THEME.bg }}>
               <h2 className="text-2xl font-bold text-amber-500 mb-6 uppercase border-b border-gray-700 pb-2">Управление Воздушным Пространством</h2>
               <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-[#252723] border border-gray-700">
                     <h4 className="font-bold text-white">ВВС Украины</h4>
                     <p className="text-2xl font-mono text-blue-400 mt-2">{gameState.airForce.ukr} самолетов</p>
                  </div>
                  <div className="p-4 bg-[#252723] border border-gray-700">
                     <h4 className="font-bold text-white">ВКС РФ</h4>
                     <p className="text-2xl font-mono text-red-400 mt-2">{gameState.airForce.rus} самолетов</p>
                  </div>
                  <div className="p-4 bg-[#252723] border border-gray-700">
                     <h4 className="font-bold text-white">Превосходство в воздухе</h4>
                     <p className="text-2xl font-mono text-yellow-500 mt-2">{gameState.airForce.ukrAirSuperiority}%</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <button onClick={() => handleAirMission('sup')} className="w-full p-4 bg-[#2d302b] hover:bg-[#353832] border border-gray-700 text-left">
                     <h4 className="font-bold text-white">Завоевание превосходства (20 PP)</h4>
                     <p className="text-xs text-gray-400">Усилить воздушные патрули. Превосходство авиации повышает боевую эффективность наземных сил ВСУ на 15%.</p>
                  </button>
                  <button onClick={() => handleAirMission('strike')} className="w-full p-4 bg-[#2d302b] hover:bg-[#353832] border border-gray-700 text-left">
                     <h4 className="font-bold text-white">Штурмовые удары по колоннам (20 PP)</h4>
                     <p className="text-xs text-gray-400">Нанести удары бомбардировочной авиацией по наступающим силам врага. Снижает прочность и организацию передовых частей РФ.</p>
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: ИНСПЕКТОР ОБЪЕКТОВ И ПРИКАЗОВ */}
        <div className="w-80 border-l-2 flex flex-col h-full shadow-[-5px_0_15px_rgba(0,0,0,0.5)] z-10 shrink-0" style={{ backgroundColor: HOI_THEME.panel, borderColor: HOI_THEME.border }}>
          {uiState.selectedNode ? (
            <div className="p-4 border-b shrink-0" style={{ borderColor: HOI_THEME.border, backgroundColor: HOI_THEME.panelLighter }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">{uiState.selectedNode.name}</h2>
                <span className="text-xs font-bold text-yellow-500 font-mono">{uiState.selectedNode.vp} VP</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 uppercase">Region / {uiState.selectedNode.terrain} / Фортификации: {uiState.selectedNode.fort}%</div>
              
              {uiState.selectedNode.owner === 'ukr' && (
                <div className="mt-4 space-y-2">
                  <div className="p-2 bg-[#1a1b18] border border-black">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Оборонительные рубежи</div>
                    <button onClick={() => handleBuildFort(uiState.selectedNode.id)} className="w-full text-center py-1 bg-yellow-900/30 border border-yellow-700 hover:bg-yellow-900/50 text-[10px] font-bold uppercase text-yellow-400">
                       Строить укрепления (-1000 Eq)
                    </button>
                  </div>

                  <div className="p-2 bg-[#1a1b18] border border-black">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Формирование частей</div>
                    <button onClick={() => handleRecruit('tdf', 1, 200, 1000, uiState.selectedNode.id)} className="w-full text-left p-1 mb-1 text-[10px] hover:bg-gray-800 flex justify-between">
                       <span>ТрО (1 дн.)</span> <span className="text-gray-500">-200 Eq</span>
                    </button>
                    {uiState.selectedNode.isMajor && (
                       <>
                          <button onClick={() => handleRecruit('mech', 4, 1000, 3000, uiState.selectedNode.id)} className="w-full text-left p-1 mb-1 text-[10px] hover:bg-gray-800 flex justify-between">
                             <span>Мех. Бригада (4 дн.)</span> <span className="text-gray-500">-1k Eq</span>
                          </button>
                          <button onClick={() => handleRecruit('tank', 6, 2500, 2500, uiState.selectedNode.id)} className="w-full text-left p-1 text-[10px] hover:bg-gray-800 flex justify-between">
                             <span>Танковая (6 дн.)</span> <span className="text-gray-500">-2.5k Eq</span>
                          </button>
                       </>
                    )}
                  </div>
                </div>
              )}

              {uiState.selectedNode.owner === 'rus' && gameState.missiles.ukr > 0 && (
                <div className="mt-4">
                  <button onClick={() => handleMissileStrike(uiState.selectedNode.id)} className="w-full py-2 bg-red-900/50 hover:bg-red-900 border border-red-700 text-[10px] text-red-200 font-bold uppercase">
                     🚀 Нанести Ракетный Удар
                  </button>
                </div>
              )}
            </div>
          ) : (
             <div className="p-4 text-xs text-gray-500 text-center border-b border-black shrink-0">Сектор не выбран</div>
          )}

          <div className="flex-grow p-4 overflow-y-auto">
            {uiState.selectedUnit ? (
              <div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{uiState.selectedUnit.faction === 'ukr' ? 'ВСУ' : 'ВСРФ'}</div>
                 <h3 className="text-lg font-bold text-white mb-1 border-b border-gray-700 pb-2">{uiState.selectedUnit.name}</h3>
                 
                 <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-[#1a1b18] p-1 text-center border border-[#333]">
                          <span className="text-[9px] text-gray-500 uppercase block">Опыт</span>
                          <span className="text-xs font-bold text-purple-400">{getExpLevel(uiState.selectedUnit.exp)}</span>
                       </div>
                       <div className="bg-[#1a1b18] p-1 text-center border border-[#333]">
                          <span className="text-[9px] text-gray-500 uppercase block">Снабжение</span>
                          <span className={`text-xs font-bold ${uiState.selectedUnit.outOfSupplyDays > 0 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                             {uiState.selectedUnit.outOfSupplyDays > 0 ? 'ОТРЕЗАН' : 'НОРМА'}
                          </span>
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                          <span className="text-gray-400">Прочность (HP)</span>
                          <span>{Math.round(uiState.selectedUnit.hp)}%</span>
                       </div>
                       <div className="w-full h-2 bg-black border border-gray-800"><div className="h-full bg-orange-700" style={{width: `${uiState.selectedUnit.hp}%`}}></div></div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                          <span className="text-gray-400">Организация (Мораль)</span>
                          <span>{Math.round(uiState.selectedUnit.org)}%</span>
                       </div>
                       <div className="w-full h-2 bg-black border border-gray-800"><div className="h-full bg-green-700" style={{width: `${uiState.selectedUnit.org}%`}}></div></div>
                    </div>
                 </div>

                 {uiState.selectedUnit.faction === 'ukr' && (
                    <div className="p-2 bg-[#1a1b18] border border-black mb-4">
                       <div className="text-[9px] font-bold text-gray-500 uppercase mb-2">Командующий</div>
                       <select 
                         value={uiState.selectedUnit.general || ''} 
                         onChange={(e) => handleAssignGeneral(uiState.selectedUnit.id, e.target.value)}
                         className="w-full bg-[#252723] text-xs text-white border border-gray-700 p-1 font-mono"
                       >
                         <option value="">Без генерала</option>
                         {Object.values(GENERALS).map(g => (
                           <option key={g.id} value={g.id}>{g.name}</option>
                         ))}
                       </select>
                    </div>
                 )}

                 {uiState.selectedUnit.inCombat && (
                    <div className="p-2 mb-4 bg-red-900/30 border border-red-900 text-red-400 text-xs text-center font-bold uppercase animate-pulse">
                       ⚔️ Подразделение в бою
                    </div>
                 )}

                 {uiState.selectedUnit.faction === 'ukr' && (
                    <div className="p-3 bg-[#1a1b18] border border-black">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3 text-center tracking-widest">Передислокация сил</h4>
                       <div className="space-y-1 font-mono">
                          {EDGES.filter(e => e[0] === uiState.selectedUnit.location || e[1] === uiState.selectedUnit.location).map((e, idx) => {
                             const targetId = e[0] === uiState.selectedUnit.location ? e[1] : e[0];
                             const isEnemy = gameState.units.some(u => u.location === targetId && u.faction !== uiState.selectedUnit.faction);
                             
                             return (
                               <button 
                                 key={idx}
                                 onClick={() => issueOrder(uiState.selectedUnit.id, targetId)}
                                 className={`w-full text-left p-2 text-[10px] font-bold uppercase tracking-wide border transition-colors flex justify-between group
                                    ${getUnitOrder(uiState.selectedUnit.id) === targetId 
                                       ? 'bg-amber-900/50 border-amber-500 text-amber-400' 
                                       : (isEnemy ? 'bg-red-900/20 border-red-900 text-red-300 hover:bg-red-900/40' : 'bg-[#252723] border-[#333] hover:border-gray-500 text-gray-300')}
                                 `}
                               >
                                 <span>{isEnemy ? 'АТАКОВАТЬ' : 'МАРШ'}: {INITIAL_NODES[targetId].name}</span>
                                 <ChevronRight size={12} className="opacity-0 group-hover:opacity-100"/>
                               </button>
                             )
                          })}
                       </div>

                       {getUnitOrder(uiState.selectedUnit.id) && (
                          <button onClick={() => {
                             const newOrders = {...uiState.orders};
                             delete newOrders[uiState.selectedUnit.id];
                             setUiState({...uiState, orders: newOrders});
                          }} className="w-full mt-3 p-2 text-[10px] uppercase font-bold text-gray-500 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors">
                             Отменить приказ
                          </button>
                       )}
                    </div>
                 )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                 <Target size={48} className="mb-4"/>
                 <p className="text-xs uppercase font-bold text-center">Штаб ожидает<br/>выбора подразделения</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}