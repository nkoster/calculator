import React, {useEffect, useReducer} from 'react'
import './App.css'
import './styles.css'
import DigitButton from './DigitButton'
import OperationButton from './OperationButton'

export const ACTIONS = {
  ADD_DIGIT: 'ADD_DIGIT',
  DELETE_DIGIT: 'DELETE_DIGIT',
  CHOOSE_OPERATION: 'CHOOSE_OPERATION',
  CLEAR: 'CLEAR',
  EVALUATE: 'EVALUATE'
}

const evaluate = ({previousOperand, currentOperand, operation}) => {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ''
  let computation = ''
  switch (operation) {
    case '+':
      computation = prev + current
      break
    case '-':
      computation = prev - current
      break
    case '*':
      computation = prev * current
      break
    case '/':
      computation = prev / current
      break
  }
  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0
})

const formatOperand = operand => {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) {
    return INTEGER_FORMATTER.format(integer)
  }
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

const reducer = (state, {type, payload}) => {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      if (payload.digit === '0' && state.currentOperand === '0') {
        return state
      }
      if (payload.digit === '.' && state.currentOperand.includes('.')) {
        return state
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`
      }
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: null,
          overwrite: false
        }
      }
      if (state.currentOperand == null) {
        return state
      }
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    case ACTIONS.CLEAR:
      return {}
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        currentOperand: null,
        operation: payload.operation
      }
    case ACTIONS.EVALUATE:
      if (state.operation == null || state.previousOperand == null || state.currentOperand == null) {
        return state
      }
      return {
        ...state,
        currentOperand: evaluate(state),
        previousOperand: null,
        operation: null,
        overwrite: true
      }
    default:
      throw new Error('Unknow action type in reducer.')
  }
}

const App = () => {

  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(reducer, {})

  const handleKeyDown = evt => {
    if (!isNaN(evt.key) || evt.code === 'Period') {
      dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: evt.key }})
      return
    }
    switch (evt.code) {
      case 'Backspace':
        dispatch({ type: ACTIONS.CLEAR })
        break
      case 'Delete':
        dispatch({ type: ACTIONS.DELETE_DIGIT })
        break
      case 'Equal':
        evt.preventDefault()
        dispatch({ type: ACTIONS.EVALUATE })
        break
      case 'Slash':
        evt.preventDefault()
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '/' } })
        break
    }
    if (evt.key === '+') {
      dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '+' } })
      return
    }
    if (evt.key === '*') {
      dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '*' } })
      return
    }
    if (evt.key === '-') {
      dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '-' } })
      return
    }

  }

  const handleKeyPress = evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      dispatch({ type: ACTIONS.EVALUATE })
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keypress', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [])

  return (
    <div>
      <div className='calculator-grid'>
        <div className='output'>
          <div className='previous-operand'>{formatOperand(previousOperand)} {operation}</div>
          <div className='current-operand'>{formatOperand(currentOperand)}</div>
        </div>
        <button onClick={() => dispatch({type: ACTIONS.CLEAR})} className='span-two'>AC</button>
        <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
        <OperationButton operation='/' dispatch={dispatch}>/</OperationButton>
        <DigitButton digit='1' dispatch={dispatch} />
        <DigitButton digit='2' dispatch={dispatch} />
        <DigitButton digit='3' dispatch={dispatch} />
        <OperationButton operation='*' dispatch={dispatch}>*</OperationButton>
        <DigitButton digit='4' dispatch={dispatch} />
        <DigitButton digit='5' dispatch={dispatch} />
        <DigitButton digit='6' dispatch={dispatch} />
        <OperationButton operation='+' dispatch={dispatch}>+</OperationButton>
        <DigitButton digit='7' dispatch={dispatch} />
        <DigitButton digit='8' dispatch={dispatch} />
        <DigitButton digit='9' dispatch={dispatch} />
        <OperationButton operation='-' dispatch={dispatch}>-</OperationButton>
        <DigitButton digit='.' dispatch={dispatch} />
        <DigitButton digit='0' dispatch={dispatch} />
        <button onClick={() => dispatch({type: ACTIONS.EVALUATE})} className='span-two'>=</button>
      </div>
    </div>

  )
}

export default App
