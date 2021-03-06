import React, { PropTypes } from 'react'
import Relay from 'react-relay'
import { Route, IndexRoute, IndexRedirect } from 'react-router'
import Loading from 'components/Loading/Loading'
import RootView from 'views/RootView/RootView'
import RootRedirectView from 'views/RootView/RootRedirectView'
import TokenRedirectView from 'views/RootView/TokenRedirectView'
import StructureView from 'views/models/StructureView/StructureView'
import FieldPopup from 'views/models/StructureView/FieldPopup'
import BrowserView from 'views/models/BrowserView/BrowserView'
import ModelRedirectView from 'views/models/ModelRedirectView'
import PlaygroundView from 'views/playground/PlaygroundView/PlaygroundView'
import GettingStartedView from 'views/GettingStartedView/GettingStartedView'
import AccountView from 'views/account/AccountView/AccountView'
import SettingsTab from 'views/account/AccountView/SettingsTab'
import ResetPasswordView from 'views/account/ResetPasswordView/ResetPasswordView'
import LoginView from 'views/LoginView/LoginView'
import ActionsView from 'views/ActionsView/ActionsView'
import * as cookiestore from 'utils/cookiestore'

// TODO https://github.com/relay-tools/react-router-relay/issues/156
class RedirectOnMount extends React.Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  componentWillMount () {
    this.context.router.replace(this.props.to)
  }

  render () {
    return false
  }
}

const ViewerQuery = {
  viewer: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('viewer', variables)}
      }
    }
  `,
}

/* eslint-disable react/prop-types */
const render = ({ error, props, routerProps, element }) => {
  if (error) {
    const err = error.source.errors[0]
    analytics.track('error', {
      error: JSON.stringify(err),
    })

    if (err.code === 1003) {
      cookiestore.remove('graphcool_token')
      cookiestore.remove('graphcool_user_id')
      window.localStorage.clear()

      return (
        <RedirectOnMount to='/login' />
      )
    }

    return (
      <RedirectOnMount to='/' />
    )
  }

  if (props) {
    return React.cloneElement(element, props)
  }

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Loading color='#8989B1' />
    </div>
  )
}
/* eslint-enable react/prop-types */

export default (
  <Route path='/'>
    <IndexRoute component={RootRedirectView} queries={ViewerQuery} render={render} />
    <Route path='token' component={TokenRedirectView} />
    <Route path='login' component={LoginView} queries={ViewerQuery} render={render} />
    <Route path='reset-password' component={ResetPasswordView} />
    <Route path=':projectName' component={RootView} queries={ViewerQuery} render={render}>
      <Route path='account' component={AccountView}>
        <Route path='settings' component={SettingsTab} queries={ViewerQuery} render={render} />
        {/* <Route path='usage' component={SettingsTab} queries={ViewerQuery} render={render} /> */}
        <IndexRedirect to='settings' />
      </Route>
      <Route path='models'>
        <IndexRoute component={ModelRedirectView} queries={ViewerQuery} render={render} />
        <Route path=':modelName/structure' component={StructureView} queries={ViewerQuery} render={render}>
          <Route path='edit/:fieldName' component={FieldPopup} queries={ViewerQuery} render={render} />
          <Route path='create' component={FieldPopup} queries={ViewerQuery} render={render} />
        </Route>
        <Route path=':modelName/browser' component={BrowserView} queries={ViewerQuery} render={render} />
        <Route path=':modelName' component={ModelRedirectView} queries={ViewerQuery} render={render} />
      </Route>
      <Route path='actions' component={ActionsView} queries={ViewerQuery} render={render} />
      <Route path='playground' component={PlaygroundView} queries={ViewerQuery} render={render} />
      <Route path='getting-started' component={GettingStartedView} queries={ViewerQuery} render={render} />
      <IndexRedirect to='getting-started' />
    </Route>
  </Route>
)
