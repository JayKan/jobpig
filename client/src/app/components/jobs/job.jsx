import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {request} from '../../lib/util';
import Prospect from './prospect.jsx';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';

//Alt
import JobStore from '../../lib/JobStore';
import JobActions from '../../lib/JobActions';
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
class Job extends React.Component {
  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    let job = this.props.job,
      editing = this.props.editing == job.id;

    window.setTimeout(()=> { // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
      if (editing) return this.refs.noteRef.focus();
    });

    return <div className='padded'>
      <mui.Card>
        <mui.CardTitle
          title={<a href={job.url} target='_blank'>{job.title}</a>}
          subtitle={this._meta(job)}
        />
        <mui.CardText>
          {editing ?
            <mui.Paper zDepth={2} style={{padding:5}}>
              <mui.TextField
                ref='noteRef'
                hintText="Add personal comments here."
                defaultValue={job.note}
                fullWidth={true}
                multiLine={true} />
              <mui.FlatButton label="Save" onTouchTap={()=>this._saveNote()} />&nbsp;
              <mui.FlatButton label="Cancel" onTouchTap={()=>this._cancelNote()} />
            </mui.Paper>
            : job.note && <mui.Paper zDepth={2} style={{padding:5}}>
              <p>{job.note}</p>
            </mui.Paper>
          }
          <mui.CardActions>{
            ( job.status=='inbox' ? [
              <mui.FlatButton label="Mark Applied" onTouchTap={()=>this._setStatus('applied')}/>
            ] : [
              <mui.FlatButton label="Send to Inbox" onTouchTap={()=>this._setStatus('inbox')}/>
            ]).concat(
              <mui.FlatButton label={job.status=='inbox' ? 'Skip' : 'Hide'} onTouchTap={()=>this._setStatus('hidden')}/>,
              <mui.FlatButton label="Add Note" onTouchTap={()=>JobActions.setEditing(job.id)}/>
            )
          }</mui.CardActions>
        </mui.CardText>
      </mui.Card>

      <mui.Card style={{background:'#f8f8f8'}}>
        <mui.CardText>
          <p dangerouslySetInnerHTML={{__html:job.description}}></p>
          {job.users && job.users.map((u)=><Prospect prospect={u} />)}
        </mui.CardText>
      </mui.Card>

      {job.status=='inbox' ?
        <mui.CardActions style={{position:'fixed', right:20, bottom: 20}}>{[
          <mui.FloatingActionButton onTouchTap={()=>this._setStatus('liked')}>
            <mui.FontIcon className="material-icons">thumb_up</mui.FontIcon>
          </mui.FloatingActionButton>,
          <mui.FloatingActionButton onTouchTap={()=>this._setStatus('disliked')}>
            <mui.FontIcon className="material-icons">thumb_down</mui.FontIcon>
          </mui.FloatingActionButton>,
        ]}</mui.CardActions> : false }
    </div>;
  }

  _meta(job){
    let score = job.score>0 ? `+${job.score}` : job.score<0 ? job.score : false;
    let meta = _.filter([
      {name:"Source", text:job.source, icon:'find_in_page'},
      {name:"Company", text:job.company, icon:'supervisor_account'},
      {name:"Location", text:job.location, icon:'room'},
      {name:"Budget", text:job.budget, icon:'attach_money'},
      {name:"Score", text:score, icon:'thumb_up'},
      {name:"Tags", icon:'label', style:{color:'rgb(0, 188, 212)', textTransform:'uppercase', fontWeight:500}, text: _.pluck(job.tags, 'key').join(', ') }
    ], 'text');
    return <span>
      {meta.map(m=> <mui.ListItem key={m.name} primaryText={m.text} style={m.style} leftIcon={
        <mui.IconButton iconClassName="material-icons" tooltip={m.name}>{m.icon}</mui.IconButton>
      } /> )}
    </span>;
  }

  _setStatus(status){
    JobActions.setStatus({id:this.props.job.id,status});
  }

  _cancelNote(){
    JobActions.setEditing(0);
  }

  _saveNote(){
    JobActions.saveNote({id:this.props.job.id, note:this.refs.noteRef.getValue()})
  }
}

export default Job
