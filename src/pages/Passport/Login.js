import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Icon, Input, Button } from 'antd';

import './Login.less';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Login extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }
    componentDidMount() {
        this.props.form.validateFields();
    }
    handleLogin = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
              console.log('Received values of form: ', values);
            }
        });
        this.context.store.dispatch({
            type: 'USER_LOGIN', 
            payload: this.props.form.getFieldsValue()
        })
    }
    render() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

        // Only show error after a field is touched.
        const userNameError = isFieldTouched('username') && getFieldError('username');
        const passwordError = isFieldTouched('password') && getFieldError('password');
        return (
            <div className="login-bg">
                <div className="main">
                    <h3 className="title-logo">云盘</h3>
                    <Form onSubmit={this.handleLogin}>
                        <div key="account">
                            <FormItem validateStatus={userNameError ? 'error' : ''} help={userNameError || ''} >
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入用户名' }],
                                })(
                                    <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="登录名" />
                                )}
                            </FormItem>
                            <FormItem validateStatus={passwordError ? 'error' : ''} help={passwordError || ''} >
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入密码' }],
                                })(
                                    <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button className="btn-block" type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>点击登录</Button>
                            </FormItem>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}

export default connect()(Form.create()(Login));
