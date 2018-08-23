import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { push } from 'connected-react-router'
import request from '../../utils/request'

class App extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }
    constructor() {
        super();
        this.state = { user: 'loading...' };
    }
    handleClick = () => {
        // this.props.history.push('/manage/list');
        this.context.store.dispatch(push('/manage/list'))
    }
    handleJump = () => {
        request.send({url: '/platform/getUserInfo.json'}).catch((res, req)=>{
                
        })
    }
    componentWillMount() {
        this._isMounted = true
        var self = this;
        request.send({url: '/platform/getUserInfo.json'}).then((result)=>{
            if (self._isMounted) {
                self.setState({user: JSON.stringify(result) });
            }
        }).catch((res, req)=>{
            if (self._isMounted) {
                self.setState({user: 'unknown'});
            }
        })
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    render() {
        return (
            <div className="App">
                <p onClick={this.handleClick}>Hello World Manage</p>
                <p onClick={this.handleJump}>{this.state.user}</p>
                <p>{this.context.store.getState().errorPage.page}</p>
            </div>
        );
    }
}

export default connect(((state)=>{return state.errorPage;}))(App);
