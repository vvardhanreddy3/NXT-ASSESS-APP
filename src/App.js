import {Route, Switch, Redirect} from 'react-router-dom'
import './App.css'

// write your code here
import Home from './components/Home'
import Login from './components/Login'
import Assessment from './components/Assessment'
import Result from './components/Result'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => (
  <Switch>
    <Route exact path="/login" component={Login} />
    <ProtectedRoute exact path="/" component={Home} />
    <ProtectedRoute exact path="/results" component={Result} />
    <ProtectedRoute exact path="/assessment" component={Assessment} />
    <Route exact path="/not-found" component={NotFound} />
    <Redirect to="/not-found" />
  </Switch>
)

export default App
