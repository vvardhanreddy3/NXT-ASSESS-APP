import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'

import './index.css'

const Result = props => {
  const {location} = props
  const {state} = location
  const {score, formattedRemainingTime, timeUp} = state
  const onClickLogout = () => {
    const {history} = props
    Cookies.remove('jwt_token')
    history.replace('/login')
  }

  return (
    <>
      <nav className="nav-container">
        <div className="item-container">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1704821765/Group_8005_vgjmvh.jpg"
              alt="website logo"
              className="image"
            />
          </Link>
        </div>
        <button onClick={onClickLogout} type="button" className="btn">
          Logout
        </button>
      </nav>
      <div className="bg-container">
        {timeUp ? (
          <div className="result-container">
            <img
              src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1705260308/calender_1_1_fttxjx.jpg"
              alt="time up"
              className="result-image"
            />
            <h1 className="congrats-head">Time is up!</h1>
            <p className="about-time">
              You did not complete the assessment within the time
            </p>
            <div className="time-card">
              <p className="about-score">Your Score:</p>
              <p className="score-text">{score}</p>
            </div>
            <Link to="/assessment">
              <button type="button" className="re-btn">
                Reattempt
              </button>
            </Link>
          </div>
        ) : (
          <div className="result-container">
            <img
              src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1704821915/Layer_2_prwvp6.jpg"
              alt="submit"
              className="result-image"
            />
            <h1 className="congrats-head">
              Congrats! You completed the assessment.
            </h1>
            <div className="time-card">
              <p className="about-time">Time Taken:</p>
              <p className="formatted-time-text">{formattedRemainingTime}</p>
            </div>
            <div className="time-card">
              <p className="about-score">Your Score:</p>
              <p className="score-text">{score}</p>
            </div>
            <Link to="/assessment">
              <button type="button" className="re-btn">
                Reattempt
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export default Result
