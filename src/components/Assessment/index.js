import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Header from '../Header'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Assessment extends Component {
  state = {
    assessmentQuestion: [],
    selectedNumberedQuestionIndex: 0,
    currentQuestionIndex: 0,
    answeredQuestionsCount: 0,
    unansweredQuestionsCount: 0,
    isClickedQuestionNumber: false,
    isCorrectOptionClicked: false,
    isAnyOptionClicked: false,
    selectedOption: {},
    score: 0,
    timer: 600,
    apiStatus: apiStatusConstants.initial,
    timeUp: true,
  }

  componentDidMount() {
    this.getData()
    this.startTimer()
  }

  getData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const response = await fetch('https://apis.ccbp.in/assess/questions')
    const data = await response.json()
    // console.log(data);
    if (response.ok === true) {
      const updatedData = data.questions.map(eachQuestion => ({
        id: eachQuestion.id,
        optionsType: eachQuestion.options_type,
        questionText: eachQuestion.question_text,
        options: eachQuestion.options.map(eachOption => ({
          optionId: eachOption.id,
          text: eachOption.text,
          isCorrect: eachOption.is_correct,
          imageUrl: eachOption.image_url,
        })),
      }))
      this.setState({
        assessmentQuestion: updatedData,

        apiStatus: apiStatusConstants.success,
      })
      console.log(updatedData)
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  startTimer = () => {
    this.timerFunction = setInterval(() => {
      const {timer} = this.state
      if (timer > 0) {
        this.setState(prevState => ({timer: prevState.timer - 1}))
      } else {
        clearInterval(this.timerFunction)
        this.endAssessment()
        this.setState({timeUp: false})
      }
    }, 1000)
  }

  onClickRetryButton = () => {
    this.getData()
  }

  endAssessment = () => {
    const {history} = this.props
    const {timeUp} = this.state

    history.replace('/results', {timeUp})
    clearInterval(this.timerFunction)

    this.setState({
      timeUp: true,
    })
  }

  timeToSeconds = formattedTime => {
    const timeArray = formattedTime.split(':')
    const hours = parseInt(timeArray[0], 10) || 0
    const minutes = parseInt(timeArray[1], 10) || 0
    const seconds = parseInt(timeArray[2], 10) || 0

    return hours * 3600 + minutes * 60 + seconds
  }

  secondsToTime = seconds => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    const formattedTime = `${hours
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    return formattedTime
  }

  onSubmit = () => {
    const {history} = this.props
    const {score, timer} = this.state

    const minutes = Math.floor(timer / 60)
    const hours = Math.floor(timer / 3600)
    const seconds = timer % 60
    const formattedTimer = `${hours
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    const remainingSeconds = 600 - this.timeToSeconds(formattedTimer)
    const formattedRemainingTime = this.secondsToTime(remainingSeconds)
    console.log(formattedRemainingTime)

    history.replace('/results', {score, formattedRemainingTime})
    clearInterval(this.timer)
  }

  renderAssessmentFailure = () => (
    <div className="failure-container">
      <div className="failure-content-card">
        <img
          src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1704822095/Group_7519_ed27tg.jpg"
          alt="failure view"
          className="failure-image"
        />
        <h1 className="something-went-wrong">Oops! Something went wrong</h1>
        <p className="some-trouble">We are having some trouble</p>
        <button
          onClick={this.onClickRetryButton}
          className="retry-btn"
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  )

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#263868" height={50} width={50} />
    </div>
  )

  renderAssessmentSuccess = () => {
    const {timer} = this.state
    const hours = Math.floor(timer / 3600)
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    console.log(seconds)
    const formattedTimer = `${hours
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    return (
      <div className="assessment-main-container">
        <div className="assessment-questions-container">
          {this.renderQuestion()}
        </div>
        <div className="summary-timer-container">
          <div className="timer-container">
            <p className="time-heading">Time Left</p>
            <p className="timer">{formattedTimer}</p>
          </div>
          <div className="assessment-summary-container">
            {this.renderAssessmentSummary()}
          </div>
        </div>
      </div>
    )
  }

  renderAssessmentDetails = () => {
    const {apiStatus} = this.state
    console.log(apiStatus)
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderAssessmentSuccess()
      case apiStatusConstants.failure:
        return this.renderAssessmentFailure()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  onClickSummaryButton = id => {
    const {assessmentQuestion} = this.state
    const selectedQuestionData = assessmentQuestion.findIndex(
      item => item.id === id,
    )
    console.log(selectedQuestionData)
    this.setState(prevState => ({
      isAnyOptionClicked: false,
      isCorrectOptionClicked: !prevState.isCorrectOptionClicked,
      selectedNumberedQuestionIndex: selectedQuestionData,
      currentQuestionIndex: selectedQuestionData,
      isClickedQuestionNumber: true,
    }))
    // if (isCorrectOptionClicked) {
    //   this.setState(prevState => ({
    //     score: prevState.score + 1,
    //   }))
    // }
  }

  onClickAnswer = id => {
    const {
      assessmentQuestion,
      currentQuestionIndex,
      isCorrectOptionClicked,
      isAnyOptionClicked,
      answeredQuestionsCount,
      selectedOption,
    } = this.state

    const currentQuestion = assessmentQuestion[currentQuestionIndex]
    const selectedOptionData = currentQuestion.options.find(
      item => item.optionId === id,
    )
    // if (isCorrectOptionClicked || isAnyOptionClicked) {
    //   this.setState(prevState => ({
    //     answeredQuestionsCount: prevState.answeredQuestionsCount + 1,
    //     isCorrectOptionClicked: false,
    //     isAnyOptionClicked: false,
    //   }))
    // }

    if (selectedOptionData.isCorrect === 'true') {
      this.setState(prevState => ({
        score: !isCorrectOptionClicked ? prevState.score + 1 : prevState.score,
        isCorrectOptionClicked: true,
      }))
    }
    if (!selectedOption[currentQuestionIndex]) {
      this.setState(prevState => ({
        answeredQuestionsCount: prevState.answeredQuestionsCount + 1,
      }))
    }

    this.setState(prevState => ({
      selectedOption: {
        ...prevState.selectedOption,
        [currentQuestionIndex]: id,
      },
    }))
  }

  handleOnClickNextBtn = () => {
    const {currentQuestionIndex, assessmentQuestion} = this.state
    if (currentQuestionIndex < assessmentQuestion.length - 1) {
      this.setState(prevState => ({
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
        isClickedQuestionNumber: false,
      }))
    }
    // if (isCorrectOptionClicked || isAnyOptionClicked) {
    //   this.setState(prevState => ({
    //     answeredQuestionsCount: prevState.answeredQuestionsCount + 1,
    //     isCorrectOptionClicked: false,
    //     isAnyOptionClicked: false,
    //   }))
    // }
    this.setState(prevState => ({
      //   score: isCorrectOptionClicked ? prevState.score + 1 : prevState.score,
      isAnyOptionClicked: false,
      isCorrectOptionClicked: false,
    }))
  }

  renderAssessmentSummary = () => {
    const {
      answeredQuestionsCount,
      assessmentQuestion,
      isClickedQuestionNumber,
      isAnyOptionClicked,
      currentQuestionIndex,
    } = this.state
    const total = assessmentQuestion.length

    const attemptedQuestions = new Set()

    if (isClickedQuestionNumber && answeredQuestionsCount > 0) {
      for (let i = 0; i <= currentQuestionIndex; i += 1) {
        attemptedQuestions.add(i)
      }
    }
    return (
      <div className="assessment-summary">
        <div className="answered-unanswered-card">
          <p className="answered-span">{answeredQuestionsCount}</p>
          <p className="answered">Answered Questions</p>
          <p className="unanswered-span">
            {assessmentQuestion.length - answeredQuestionsCount}
          </p>
          <p className="unanswered">Unanswered Questions</p>
        </div>
        <hr className="summary-horizontal-line" />
        <div className="question-submit-btn-card">
          <div>
            <h1 className="question-number-heading">Questions ({total})</h1>
            <ul className="question-number-card">
              {assessmentQuestion.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`${
                      index === currentQuestionIndex && isClickedQuestionNumber
                        ? 'question-number-selected'
                        : 'question-number'
                    } ${
                      attemptedQuestions.has(index) && isAnyOptionClicked
                        ? 'attempted'
                        : 'question-number'
                    }`}
                    onClick={() => this.onClickSummaryButton(item.id)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={this.onSubmit} type="button" className="submit-btn">
            Submit Assessment
          </button>
        </div>
      </div>
    )
  }

  renderQuestion = () => {
    const {
      assessmentQuestion,
      currentQuestionIndex,
      selectedNumberedQuestionIndex,
      isClickedQuestionNumber,
      isCorrectOptionClicked,
      selectedOption,
      //   score,
    } = this.state

    console.log(isCorrectOptionClicked)
    console.log(selectedOption)
    const currentQuestion =
      assessmentQuestion[
        isClickedQuestionNumber
          ? selectedNumberedQuestionIndex
          : currentQuestionIndex
      ]
    const questionNumber = isClickedQuestionNumber
      ? selectedNumberedQuestionIndex
      : currentQuestionIndex

    const selectedOptionId = selectedOption[questionNumber]

    const isLastQuestion = questionNumber === assessmentQuestion.length - 1

    const {questionText, options, optionsType} = currentQuestion

    return (
      <div data-testid="questionItem" className="question-main-container">
        <p className="question-text">
          {questionNumber + 1}. {questionText}
        </p>
        <hr className="horizontal-line" />
        {optionsType === 'DEFAULT' && (
          <ul className="option-container">
            {options.map(option => (
              <li key={option.optionId}>
                <button
                  type="button"
                  className={
                    selectedOptionId === option.optionId ? 'selected' : 'normal'
                  }
                  onClick={() => this.onClickAnswer(option.optionId)}
                >
                  {option.text}
                </button>
              </li>
            ))}
          </ul>
        )}
        {optionsType === 'IMAGE' && (
          <ul className="option-container">
            {options.map(option => (
              <li key={option.optionId}>
                <img
                  className={
                    selectedOptionId === option.optionId
                      ? 'selectedImg'
                      : 'normalImg'
                  }
                  onClick={() => this.onClickAnswer(option.optionId)}
                  src={option.imageUrl}
                  alt={option.text}
                />
              </li>
            ))}
          </ul>
        )}
        {optionsType === 'SINGLE_SELECT' && (
          <>
            <div className="mini-card">
              <select
                className="select-card"
                onChange={e => this.onClickAnswer(e.target.value)}
              >
                {options.map(option => (
                  <option
                    className={
                      selectedOptionId === option.optionId
                        ? 'selectedOption'
                        : 'normalOption'
                    }
                    value={option.optionId}
                    key={option.optionId}
                  >
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
            <p className="selected-by-default">
              First option is selected by default
            </p>
          </>
        )}
        <div className="btn-card">
          {isLastQuestion ? null : (
            <button
              type="button"
              className="nxt-button"
              onClick={this.handleOnClickNextBtn}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    )
  }

  render() {
    return (
      <>
        <Header />
        {this.renderAssessmentDetails()}
      </>
    )
  }
}

export default Assessment
