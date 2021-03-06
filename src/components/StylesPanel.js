import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import { SketchPicker } from 'react-color';
import _ from 'lodash';

const dashArraySettings = [
  '5, 5',
  '5, 10',
  '10, 5',
  '5, 1',
  '1, 5',
  '0.9',
  '15, 10, 5',
  '15, 10, 5, 10',
  '15, 10, 5, 10, 15',
  '5, 5, 1, 5',
];

export class StylesPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
     inferred: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      inferredUpperBound: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      inferredLowerBound: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      inferredBand: {
        fillColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        interpolation: 'basis',
      },
      measurement: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
        },
        fillColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        radius: 2.8,
      },
      misc: {
        colorPicker: false,
        expanded: null
      }
    };

    this.toggleSection = this.toggleSection.bind(this);
  }

  handleColorChange(parent, setting, color) {
    const change = {};
    change[parent] = this.state[parent];
    change[parent][setting] = color.rgb;

    this.props.actions.configureChart({
      styles: _.omit(this.state, 'misc')
    });

    this.setState(change);
  }

  handleChange(parent, setting, event) {
    const change = {};
    change[parent] = this.state[parent];
    change[parent][setting] = _.isString(event) ? event : event.currentTarget.value;

    this.props.actions.configureChart({
      styles: _.omit(this.state, 'misc')
    });

    this.setState(change);
  }

  handleClick(setting) {
    const change = this.state.misc;
    change.colorPicker = !this.state.misc.colorPicker;
    this.setState({ misc: change });
  }

  handleClose(setting) {
    const change = this.state.misc;
    change.colorPicker = false;
    this.setState({ misc: change });
  }

  toggleSection(section, ev) {
    ev.preventDefault();

    const val = this.state.misc.expanded === section ? null : section;
    this.setState({
      misc: _.merge(this.state.misc, { expanded: val, colorPicker: false })
    });
  }

  render() {
    let index;
    let highlight;
    if (this.state.misc.expanded !== null) {
      index = dashArraySettings.indexOf(this.state[this.state.misc.expanded].dashArray);
      if (index === -1) {
        index = 0;
      } else {
        index++;
      }

      highlight = <rect x="0" y={'' + (20 * index)}  width="210" height="20" style={{fill: 'rgba(198, 203, 215, 0.29)'}}></rect>;
    }

    return (
      <aside className="right-sidebar-wrap sidebar-fixed secondary-panel" id="styles-panel">
        <ul className="sidebar-tab list-unstyled clearfix font-header font-11 bg-main">
          <li className="active" style={{width: '100%'}}>
            <a href="#" className="text-muted">Custom Styles</a>
          </li>
        </ul>
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <div className="list-group font-12">
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('inferred', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'inferred' ? 'fa-caret-down' : 'fa-caret-right')}></i> Inferred Value
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'inferred') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.inferred.strokeWidth} onChange={(ev) => this.handleChange('inferred', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'inferred') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.inferred.strokeColor.r }, ${ this.state.inferred.strokeColor.g }, ${ this.state.inferred.strokeColor.b }, ${ this.state.inferred.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'inferred') } />
                          <SketchPicker color={ this.state.inferred.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'inferred', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('inferred', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line key={'dash-' + i} onClick={(ev) => this.handleChange('inferred', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.inferred.interpolation} onChange={(ev) => this.handleChange('inferred', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('inferredUpperBound', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'inferredUpperBound' ? 'fa-caret-down' : 'fa-caret-right')}></i> Inferred Upper Bound
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'inferredUpperBound') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.inferredUpperBound.strokeWidth} onChange={(ev) => this.handleChange('inferredUpperBound', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'inferredUpperBound') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.inferredUpperBound.strokeColor.r }, ${ this.state.inferredUpperBound.strokeColor.g }, ${ this.state.inferredUpperBound.strokeColor.b }, ${ this.state.inferredUpperBound.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'inferredUpperBound') } />
                          <SketchPicker color={ this.state.inferredUpperBound.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'inferredUpperBound', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('inferredUpperBound', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line key={'dash-' + i} onClick={(ev) => this.handleChange('inferredUpperBound', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.inferredUpperBound.interpolation} onChange={(ev) => this.handleChange('inferredUpperBound', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('inferredLowerBound', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'inferredLowerBound' ? 'fa-caret-down' : 'fa-caret-right')}></i> Inferred Lower Bound
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'inferredLowerBound') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.inferredLowerBound.strokeWidth} onChange={(ev) => this.handleChange('inferredLowerBound', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'inferredLowerBound') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.inferredLowerBound.strokeColor.r }, ${ this.state.inferredLowerBound.strokeColor.g }, ${ this.state.inferredLowerBound.strokeColor.b }, ${ this.state.inferredLowerBound.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'inferredLowerBound') } />
                          <SketchPicker color={ this.state.inferredLowerBound.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'inferredLowerBound', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('inferredLowerBound', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line key={'dash-' + i} onClick={(ev) => this.handleChange('inferredLowerBound', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.inferredLowerBound.interpolation} onChange={(ev) => this.handleChange('inferredLowerBound', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('inferredBand', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'inferredBand' ? 'fa-caret-down' : 'fa-caret-right')}></i> Inferred Band
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'inferredBand') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label>Fill Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'inferredBand') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.inferredBand.fillColor.r }, ${ this.state.inferredBand.fillColor.g }, ${ this.state.inferredBand.fillColor.b }, ${ this.state.inferredBand.fillColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'inferredBand') } />
                          <SketchPicker color={ this.state.inferredBand.fillColor } onChange={(color) => this.handleColorChange.call(this, 'inferredBand', 'fillColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.inferredBand.interpolation} onChange={(ev) => this.handleChange('inferredBand', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('measurement', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'measurement' ? 'fa-caret-down' : 'fa-caret-right')}></i> Sensor Measurement
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'measurement') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label>Radius</label>
                      <input type="number" className="form-control" value={this.state.measurement.radius} onChange={(ev) => this.handleChange('measurement', 'radius', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label>Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.measurement.strokeWidth} onChange={(ev) => this.handleChange('measurement', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label>Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'measurement') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.measurement.strokeColor.r }, ${ this.state.measurement.strokeColor.g }, ${ this.state.measurement.strokeColor.b }, ${ this.state.measurement.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'measurement') } />
                          <SketchPicker color={ this.state.measurement.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'measurement', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label>Fill Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'measurement') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.measurement.fillColor.r }, ${ this.state.measurement.fillColor.g }, ${ this.state.measurement.fillColor.b }, ${ this.state.measurement.fillColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'measurement') } />
                          <SketchPicker color={ this.state.measurement.fillColor } onChange={(color) => this.handleColorChange.call(this, 'measurement', 'fillColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label>Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('measurement', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line key={'dash-' + i} onClick={(ev) => this.handleChange('measurement', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="slimScrollBar" style={{width: '2px', position: 'absolute', top: '0px', opacity: 0.4, display: 'none', borderRadius: '7px', zIndex: 99, right: '1px', height: '899px', background: 'rgb(149, 164, 184)'}}></div>
          <div className="slimScrollRail" style={{width: '2px', height: '100%', position: 'absolute', top: '0px', display: 'none', borderRadius: '7px', opacity: 0.2, zIndex: 90, right: '1px', background: 'rgb(51, 51, 51)'}}></div>
        </div>
      </aside>
    );
  }
};

const mapStateToProps = (state) => ({
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(StylesPanel);
