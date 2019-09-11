import * as Data from '../data';
import * as Util from '../util';
import * as Roster from '../roster';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import React, { Component, PropTypes } from 'react';
import ClassCard from './classCard';
import GrowthsTable from './growthsTable';

class CharacterPlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			charPlan: Roster.findCharPlan(this.props.roster, this.props.charData.name),
			supportable: this.getSupportable(),
		};
		if(!this.state.charPlan) {
			throw `Can't find charPlan for ` + this.props.charData.name;
		}
		this.getSupportable = this.getSupportable.bind(this);
		this.renderCharPlanClasses = this.renderCharPlanClasses.bind(this);
		this.renderClasses = this.renderClasses.bind(this);
	}
	getSupportable() {
		let allSupports = this.props.charData.supports;
		let res = allSupports.filter((name) => {
			return Roster.findActiveCharPlan(this.props.roster, name);
		});
		return res;
	}
	renderCharPlanClasses() {
		return Object.keys(this.state.charPlan.classes)
			.map((name) => {
				return Data.findClass(name);
			})
			.sort(Util.compareClass)
			.map((classData) => {
				let action = () => {
					this.props.updateRoster(Roster.toggleClass(this.props.roster, this.state.charPlan, classData.name));
				};
				return (<li key={classData.name}>
					<ClassCard data={classData} handleClick={action} isAdded={true} />
				</li>);
			});
	}
	renderClasses() {
		return Data.STATIC.classes
			.filter((classData) => {
				return this.state.charPlan.classes[classData.name] === undefined;
			})
			.map((classData) => {
				let name = classData.name;
				let action = () => {
					this.props.updateRoster(Roster.toggleClass(this.props.roster, this.state.charPlan, name));
				};
				return (<li key={name}>
					<ClassCard data={classData} handleClick={action} isAdded={false} />
				</li>);
			});
	}
	render() {
		return (<div className="main-card">
			<div id="character-name" className="main-card-header">
				<h1>{this.props.charData.name}</h1>
			</div>
			<div className="main-card-body has-tabs">
				<Tabs>
					<TabList>
						<Tab>Overview</Tab>
						<Tab>Classes</Tab>
						<Tab>Skill Levels</Tab>
						<Tab>Abilities</Tab>
					</TabList>
					<TabPanel>
						<div className="character-body main-card-content">
							<div id="supportable" className="card">
								<span className="heavy">{this.state.supportable.length}</span> supportable allies
							</div>
							<div id="base-growths" className="card">
								<h3>Growths</h3>
								<GrowthsTable growths={this.props.charData.growths} tableType="BASE" />
							</div>
						</div>
					</TabPanel>
					<TabPanel>
						<div className="main-card-content">
							<ol className="classes-list">
								{this.renderCharPlanClasses()}
							</ol>
							<ol className="classes-list">
								{this.renderClasses()}
							</ol>
						</div>
					</TabPanel>
					<TabPanel>
					</TabPanel>
					<TabPanel>
					</TabPanel>
				</Tabs>

			</div>
		</div>);
	}
}

export default CharacterPlan;