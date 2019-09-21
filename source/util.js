export function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

export function appraiseBaseGrowthRate(val) {
	if(val <= 30) {
		return 'bad';
	}
	if(val >= 50) {
		return 'good';
	}
	return 'neutral';
}
export function appraiseGrowthRateModifier(val) {
	if(val < 0) {
		return 'bad';
	}
	if(val > 0) {
		return 'good';
	}
	return 'neutral';
}
export function classifyProficiency(val) {
	if(val === '+') {
		return 'good';
	}
	if(val === '-') {
		return 'bad';
	}
	if(val.indexOf('B') !== -1) {
		return 'budding';
	}
	return 'neutral';
}
export function compareClass(dataA, dataB) {
	const tierOrder = ['basic', 'beginner', 'intermediate', 'advanced', 'master', 'event'];
	let a = tierOrder.indexOf(dataA.tier);
	let b = tierOrder.indexOf(dataB.tier);
	if(a - b !== 0) {
		return a- b;
	}
	return dataA.name.localeCompare(dataB.name);
}
export function compareGrade(gradeA, gradeB) {
	const grades = ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S'];
	let a = grades.indexOf(gradeA.tier);
	let b = grades.indexOf(gradeB.tier);
	return a - b;
}