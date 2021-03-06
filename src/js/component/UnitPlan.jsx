import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import * as Data from '../data';
import { LEARNABLE_TYPE } from '../enum';
import localize from '../l10n';
import * as Roster from '../roster';
import * as Util from '../util';
import cn from 'classnames';
import ClassCard from './ClassCard';
import ClassList from './ClassList';
import GrowthsTable from './GrowthsTable';
import SkillIcon from './SkillIcon';
import SkillLevelsTable from './SkillLevelsTable';
import StarButton from './Star';

class UnitPlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			unitPlan: Roster.findUnitPlan(this.props.roster, this.props.unitData.name),
			tab: 0,
			classesRendered: false, // rendering classes is expensive so hold off if possible
		};
		if(!this.state.unitPlan) {
			throw `Can't find unitPlan for ` + this.props.unitData.name;
		}
		this.renderUnitPlanClasses = this.renderUnitPlanClasses.bind(this);
		this.renderClasses = this.renderClasses.bind(this);
		this.renderLearnableRow = this.renderLearnableRow.bind(this);
		this.renderAllLearnableRows = this.renderAllLearnableRows.bind(this);
		this.renderLearnedRows = this.renderLearnedRows.bind(this);
	}
	renderUnitPlanClasses() {
		return Object.keys(this.state.unitPlan.classes)
			.map((name) => {
				return Data.findClass(name);
			})
			.sort(Util.compareClass)
			.map((classData) => {
				let action = () => {
					this.props.updateRoster(Roster.toggleClass(this.props.roster, this.state.unitPlan, classData.name));
				};
				return (<ClassCard key={classData.name} data={classData} handleClick={action} isPinned={true} />);
			});
	}
	renderClasses() {
		return Roster.filterClasses(this.state.unitPlan)
			.map((classData) => {
				let name = classData.name;
				let action = () => {
					this.props.updateRoster(Roster.toggleClass(this.props.roster, this.state.unitPlan, name));
				};
				return (
					<ClassCard key={name} data={classData} handleClick={action} isPinned={Roster.hasPinnedClass(this.state.unitPlan, name)} />
				);
			});
	}
	renderLearnableRow(skillCat, grade, learnableInfo, type, active, onClick) {
		if(grade === 'BT') {
			grade = <span className="budding">
				<i className="material-icons">lightbulb</i>
			</span>;
		}
		return (<tr className="learnable-row" key={learnableInfo.name}>
			<td className="learnable-row-star"><StarButton active={active} onClick={onClick}></StarButton></td>
			<td className="learnable-row-skill"><span><SkillIcon skillCat={skillCat} />&nbsp;{grade}</span></td>
			<td className="learnable-row-name">{learnableInfo.name}</td>
			<td className="learnable-row-type">{localize(type)}</td>
			<td className="learnable-row-desc">{learnableInfo.desc}</td>
		</tr>);
	}
	renderLearnedRows() {
		let allLearned = this.state.unitPlan.learned;
		let flat = [];
		if (allLearned) {
			for (let learnedName in allLearned) {
				let learnedData;
				let type = Data.determineLearnableType(learnedName);
				if(LEARNABLE_TYPE.ABILITY === type) {
					learnedData = Data.findAbility(learnedName);
				} else {
					learnedData = Data.findCombatArt(learnedName);
				}
				let onClick = () => {
					this.props.updateRoster(Roster.toggleLearn(this.props.roster, this.state.unitPlan, learnedName));
				};
				let reqs = Roster.getAbilityRequirements(this.state.unitPlan, learnedName);
				flat.push({
					reqs,
					learnedData,
					type,
					onClick
				});
			}
		}
		return flat
			.sort(Util.compareLearnable)
			.map((flatItem) => {
				return this.renderLearnableRow(flatItem.reqs.skillCat, flatItem.reqs.grade, flatItem.learnedData, flatItem.type, true, flatItem.onClick);
			});
	}
	renderAllLearnableRows() {
		let flat = [];
		let all = this.props.unitData.allLearnables;
		for (let skillCat of Data.STATIC.skillCategories) {
			// iterate over all categories, not just the valid ones, to go through categories in correct order
			if(all[skillCat]) {
				for (let grade of Data.STATIC.grades) {
					if(all[skillCat][grade]) {
						let learnables = all[skillCat][grade];
						learnables.forEach((x) => {
							let info;
							let isAbility = x.type === LEARNABLE_TYPE.ABILITY;
							if(isAbility) {
								info = Data.findAbility(x.name);
							} else {
								info = Data.findCombatArt(x.name);
							}
							let isLearned = Roster.hasLearnedAbility(this.state.unitPlan, info.name);
							let onClick = () => {
								this.props.updateRoster(Roster.toggleLearn(this.props.roster, this.state.unitPlan, info.name));
							};
							flat.push(this.renderLearnableRow(skillCat, grade, info, x.type, isLearned, onClick));
						});
					}
				}
			}
		}
		return flat;
	}
	render() {
		let classesTopDisplay;
		if(this.state.unitPlan.classes && Object.keys(this.state.unitPlan.classes).length > 0) {
			classesTopDisplay = <React.Fragment>
				<h2>Pinned</h2>
				<ol className="classes-list">
					{this.renderUnitPlanClasses()}
				</ol>
			</React.Fragment>;
		}

		const personalAbility = this.props.unitData.personalAbility;
		const personalAbilityDesc = Data.findAbility(personalAbility).desc;

		let learnedTopDisplay;
		if(this.state.unitPlan.learned && Object.keys(this.state.unitPlan.learned).length > 0) {
			learnedTopDisplay = <React.Fragment>
				<div id="learning-pinned-abilities">
					<h2>Pinned</h2>
					<table className="learnables-table skill-level-learned big-table">
						<tbody>
							{this.renderLearnedRows()}
						</tbody>
					</table>
				</div>
				{Object.keys(this.state.unitPlan.learned).length > 0 ? <br/> : undefined}
			</React.Fragment>;
		}

		let renderRecruitment = null;
		let recruitmentData = this.props.unitData.recruit;
		if(recruitmentData) {
			renderRecruitment = (<div id="overview-recruitment" className="overview-unit">
				<h4>Recruitment</h4>
				<SkillIcon skillCat={recruitmentData.skill} /> {recruitmentData.skillMin.toUpperCase()}
				<br/>
				{localize(recruitmentData.stat)} {recruitmentData.statMin.toUpperCase()}
			</div>);
		}

		return (<div className="main-card has-tabs">
			<Tabs forceRenderTabPanel onSelect={(idx) => {
				this.setState({
					tab: idx,
					classesRendered: this.state.classesRendered || idx === 1,
				});
			}}>
				<TabList>
					<Tab>Overview</Tab>
					<Tab>Classes</Tab>
					<Tab>Learning</Tab>
				</TabList>
				<TabPanel>
					<div id="overview-content" className="unit-body main-card-content">
						<div id="overview-content-wrapper">
							<div id="overview-base-growths" className="overview-unit">
								<h4>Growths</h4>
								<GrowthsTable growths={this.props.unitData.growths} tableType="BASE" />
							</div>
							<div id="overview-base-proficiencies" className="overview-unit">
								<h4>Proficiencies</h4>
								<SkillLevelsTable data={this.props.unitData.skillLevels} />
							</div>
							<div id="overview-base-personal-ability" className="overview-unit">
								<h4>Personal Ability</h4>
								<strong>{personalAbility}</strong>: {personalAbilityDesc}
							</div>
							<div id="overview-supports" className="overview-unit">
								<h4>Supports</h4>
								<strong>Roster supports: {Roster.getActiveSupports(this.props.roster, this.props.unitData).length}</strong>
								<ul>
									{this.props.unitData.supports
										.map((supportName) => {
											const uPlan = Roster.findUnitPlan(this.props.roster, supportName);
											return {
												name: supportName,
												id: Data.findUnitData(supportName).id,
												active: uPlan.active
											};
										})
										.sort(Util.compareSupportableUnit)
										.map((obj) => {
											const cns = cn({
												'active-support': obj.active,
												'inactive-support': !obj.active,
												'bullet': true,
											});
											return <li key={obj.name} className={cns}>{obj.name}</li>;
										})
									}
								</ul>
							</div>
							{renderRecruitment}
						</div>
					</div>
				</TabPanel>
				<TabPanel>
					<div id="classes-content" className="main-card-content noflex">
						{classesTopDisplay}
						<h2>Browse</h2>
						<ClassList
							roster={this.props.roster}
							shouldRender={this.state.classesRendered}
							showFilter={true}
							unitPlan={this.state.unitPlan}
							updateRoster={this.props.updateRoster} />
					</div>
				</TabPanel>
				<TabPanel>
					<div id="learning-content" className="main-card-content">
						<div id="learning-content-wrapper">
							<div id="learning-learnable-abilities">
								{learnedTopDisplay}
								<h2>Browse</h2>
								<table className="learnables-table skill-level-data big-table">
									<tbody>
										{this.renderAllLearnableRows()}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</TabPanel>
			</Tabs>
		</div>);
	}
}

const renderCrests = (uData) => {
	return uData.crests.map((c) => {
		return <span><em>{c.name} - {c.type}</em>: {c.desc}</span>;
	});
};

export default UnitPlan;