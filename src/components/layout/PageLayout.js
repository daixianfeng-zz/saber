import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import LeftMenu from './LeftMenu'

class PageLayout extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        this.state = { user: localStorage.getItem('USER') }
    }

    componentWillMount() {
        this.context.store.dispatch({ type: 'USER_INFO' });
    }

    render() {
        const user = this.state.user;
        const { child: Child, needAuth, ...rest } = this.props;

        return (
            <Route {...rest} render={matchProps => {
                return (!user && needAuth) ? (
                    <Route {...rest} render={() => (
                        <Redirect to="/passport/login" />
                    )} />
                ) : (
                    <div className="page-layout">
                        <aside className="left-menu">
                            <LeftMenu />
                        </aside>
                        <section className="right-content">
                            <header className="right-top">
                                welcome
                            </header>
                            <div className="main-container"><Child {...matchProps} /></div>
                        </section>
                    </div>
                )
            }} />
        )
    }
}
export default PageLayout