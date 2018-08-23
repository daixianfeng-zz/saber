import React from 'react'
import { Route } from 'react-router-dom'
import LeftMenu from './LeftMenu'

const PageLayout = ({component: Component, ...rest}) => (
    <Route {...rest} render={matchProps => (
        <div className="page-layout">
            <aside className="left-menu">
                <LeftMenu />
            </aside>
            <section className="right-content">
                <header className="right-top">
                    welcome
                </header>
                <div className="main-container"><Component {...matchProps} /></div>
            </section>
        </div>
    )} />
)
export default PageLayout