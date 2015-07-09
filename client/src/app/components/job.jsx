let React = require('react');
let mui = require('material-ui');
var ReactFireMixin = require('reactfire');
var Firebase = require('reactfire/node_modules/firebase');
var {HotKeys, HotKeyMapMixin} = require('react-hotkeys');
var _ = require('lodash');
var request = require('superagent');

const keyMap = {
  save: 's',
  apply: 'a',
  expand: 'e',
  open: 'enter',
  hide: 'h',
  inbox: 'i',
}

module.exports = React.createClass({
  mixins: [ReactFireMixin, HotKeyMapMixin(keyMap)],

  _subtitle(job){
    return `${job.source} | ${job.company || '-'} | ${job.location || '-'} | $${job.budget || '-'}`;
  },
  _setFocus: function(c){
    this.props.focus && c.getDOMNode().focus();
  },

  componentWillMount() {
    var ref = new Firebase(`https://lefnire-test.firebaseio.com/jobs/${this.props.job.key}`);
    this.bindAsObject(ref, "job");
  },

  // Actions
  _setStatus(status){
    this.firebaseRefs.job.child('status').set(status);
  },
  action_inbox(){this._setStatus('inbox')},
  action_save(){this._setStatus('saved')},
  action_apply(){this._setStatus('applied')},
  action_hide(){this._setStatus('hidden')},
  action_open(){window.open(this.props.job.url,'_blank')},
  action_expand(){
    if (this.state.expanded)
      return this.setState({expanded:undefined});
    //job.expanding = true;
    request.get(`http://localhost:3001/jobs/${this.state.job.key}`).end((err, res) => {
      //job.expanding = false;
      this.setState({expanded: res.text});
    });
  },

  render() {
    const handlers = _.transform(keyMap, (m,v,k)=> m[k] = this['action_'+k]);
    let job = this.props.job;

    // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    window.setTimeout( ()=> this.props.focus && this.refs.jobref.getDOMNode().focus() );

    return (
      <HotKeys tabIndex="0" handlers={handlers} ref={/*this._setFocus*/"jobref"}>
        <mui.Card>
          <mui.CardTitle title={job.title} subtitle={this._subtitle(job)} />
          <mui.CardText>
            <b>{job.tags.join(', ')}</b>
            <p>{job.description}</p>
            <div dangerouslySetInnerHTML={{__html:this.state.expanded}}></div>
          </mui.CardText>
        </mui.Card>
      </HotKeys>
    )
  }
});