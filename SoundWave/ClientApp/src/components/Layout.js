import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import { Spacer } from './Spacer';
import { SideBarMenu } from './SideBarMenu';
import './NavMenu.css';

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                <NavMenu />
                <SideBarMenu />
                <Container tag="main">
                    {this.props.children}
                </Container>
                <Spacer />
            </div>
        );
    }
}
