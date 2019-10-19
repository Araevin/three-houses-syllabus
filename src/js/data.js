import { LEARNABLE_TYPE } from "./enum";
import DATA_JSON from '../data.json';

export let STATIC = {
	characters: undefined,
	universal: undefined,
	stats: undefined,
	classes: undefined,
	skillCategories: undefined,
	grades: undefined,
};

STATIC = {
	...DATA_JSON,
	stats: ['hp', 'str', 'mag', 'dex', 'spd', 'lck', 'def', 'res', 'cha'],
	skillCategories: ['sword', 'lance', 'axe', 'bow', 'brawling', 'reason', 'faith', 'authority', 'heavyArmor', 'riding', 'flying'],
	grades: ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+'],
	classTiers: ['beginner', 'intermediate', 'advanced', 'master', 'event', 'starter'],
};
STATIC.universal = STATIC.characters.find((cd) => (cd.name === 'UNIVERSAL')),
STATIC.characters = STATIC.characters.filter((cd) => (cd.name !== 'UNIVERSAL')),
STATIC.charactersMap = listToMap(STATIC.characters, 'name');
STATIC.classesMap = listToMap(STATIC.classes, 'name');
STATIC.abilitiesMap = listToMap(STATIC.abilities, 'name');
STATIC.characters.forEach((cd) => {
	buildAllLearnables(cd);
});
STATIC.classes.forEach((cd) => {
	buildRelatedSkills(cd);
});

console.log(STATIC);

function buildAllLearnables(charData) {
	charData.allLearnables = {};
	[charData.learnable, STATIC.universal.learnable].forEach((source) => {
		[source.abilities, source['combat arts']].forEach((subsource) => {
			if(subsource) {
				let type = subsource === source.abilities ? LEARNABLE_TYPE.ABILITY : LEARNABLE_TYPE.COMBAT_ART;
				for(let skill in subsource) {
					charData.allLearnables[skill] = charData.allLearnables[skill] || {};
					for(let grade in subsource[skill]) {
						let toPush = {
							name: subsource[skill][grade],
							type: type,
						};
						if(charData.allLearnables[skill][grade]) { // ability already exists
							console.log(`Learnable already exists ${charData.name} ${skill} ${grade}`);
							charData.allLearnables[skill][grade].push(toPush);
						} else {
							charData.allLearnables[skill][grade] = [toPush];
						}
					}
				}
			}
		});
	});
}
function buildRelatedSkills(classData) {
	let skills = Object.assign({}, classData.certification, classData.skillBonus);
	let relatedSkills = Object.keys(skills);
	classData.relatedSkills = [];
	for(let skill of STATIC.skillCategories) {
		if(relatedSkills.indexOf(skill) !== -1) {
			classData.relatedSkills.push(skill);
		}
	}
}
function listToMap(list, keyField) {
	const res = {};
	list.forEach((li) => {
		res[li[keyField]] = li;
	});
	return res;
}
export function findCharData(name) {
	return STATIC.charactersMap[name];
}
export function findClass(name) {
	return STATIC.classesMap[name];
}

function isApplicable(classData, charData) {
	if(classData.tags.indexOf('male') > -1 && charData.sex.indexOf('m') === -1) {
		return false;
	} else if(classData.tags.indexOf('female') > -1 && charData.sex.indexOf('f') === -1) {
		return false;
	}
	for (let n of ['Edelgard', 'Dimitri', 'Claude', 'Byleth']) {
		if(classData.tags.indexOf(n) > -1 && charData.name !== n) {
			return false;
		}
	}
	return true;
}
function hasStrength(classData, charData) {
	// TODO
	return true;
}
export function filterClasses(charPlan, filter = {pinned: false, unpinned: true, tiers: [], applicableOnly: true, strengthsOnly: true}) {
	let charData = findCharData(charPlan.name, {});
	return STATIC.classes.filter((classData) => {
		if(filter.applicableOnly && !isApplicable(classData, charData)) {
			return false;
		}
		if(filter.strengthsOnly && !hasStrength(classData, charData)) {
			return false;
		}
		if(filter.pinned && filter.unpinned) {
			if(!charPlan.classes[classData.name]) {
				return false;
			}
		} else if(filter.unpinned && filter.pinned) {
			if(charPlan.classes[classData.name]) {
				return false;
			}
		}
		return true;
	});
}
export function findAbility(name) {
	return STATIC.abilitiesMap[name];
}
export function findCombatArt(name) {
	// TODO
	return {
		name,
		desc: '',
	};
}
export function filterByHouse(house) {
	return STATIC.characters.filter((cd) => {
		if(house === 'seiros') {
			return ['kos', 'cos'].indexOf(cd.house) > -1;
		}
		return cd.house == house;
	});
}
