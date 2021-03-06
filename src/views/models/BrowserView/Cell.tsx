import * as React from 'react'
import { findDOMNode } from 'react-dom'
import Loading from '../../../components/Loading/Loading'
import { classnames } from '../../../utils/classnames'
import { valueToString, isValidValue, stringToValue } from '../utils'
import { Field } from '../../../types/types'
import ToggleButton from '../../../components/ToggleButton/ToggleButton'
import { ToggleSide } from '../../../components/ToggleButton/ToggleButton'
const classes: any = require('./Cell.scss')

type UpdateCallback = (success: boolean) => void

interface Props {
  field: Field
  value?: any
  width: number
  update: (value: any, field: Field, callback: UpdateCallback) => void
}

interface State {
  editing: boolean
  loading: boolean
}

export default class Cell extends React.Component<Props, State> {

  refs: {
    [key: string]: any;
    input: HTMLInputElement
  }

  constructor (props) {
    super(props)

    this.state = {
      editing: false,
      loading: false,
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.editing && this.state.editing && this.refs.input) {
      findDOMNode<HTMLInputElement>(this.refs.input).select()
    }
  }

  _startEditing () {
    if (this.props.field.name !== 'id') {
      this.setState({ editing: true } as State)
    }
  }

  _cancel () {
    this.setState({ editing: false } as State)
    return
  }

  _save (inputValue: string) {
    if (!isValidValue(inputValue, this.props.field)) {
      alert(`'${inputValue}' is not a valid value for field ${this.props.field.name}`)
      this.setState({ editing: false } as State)
      return
    }

    const value = stringToValue(inputValue, this.props.field)

    if (value === this.props.value) {
      this.setState({ editing: false } as State)
      return
    }

    this.setState({ loading: true } as State)

    this.props.update(value, this.props.field, () => {
      this.setState({
        editing: false,
        loading: false,
      })
    })
  }

  _onKeyDown (e: __React.KeyboardEvent) {
    switch (e.keyCode) {
      case 13:
        this._save((e.target as HTMLInputElement).value)
        break
      case 27:
        this._cancel()
        break
    }
  }

  _onEscapeTextarea (e: __React.KeyboardEvent) {
    if (e.keyCode === 27) {
      this._save((e.target as HTMLInputElement).value)
    }
  }

  _renderContent () {
    if (this.state.loading) {
      return (
        <div className={classes.loading}>
          <Loading color='#B9B9C8' />
        </div>
      )
    }

    const valueString = valueToString(this.props.value, this.props.field, true)

    if (this.state.editing) {
      if (this.props.field.isList) {
        return (
          <input
            autoFocus
            type='text'
            ref='input'
            defaultValue={valueString}
            onKeyDown={(e) => this._onKeyDown(e)}
            onBlur={(e) => this._save((e.target as HTMLInputElement).value)}
          />
        )
      }
      switch (this.props.field.typeIdentifier) {
        case 'Int':
          return (
            <input
              autoFocus
              type='number'
              ref='input'
              defaultValue={valueString}
              onBlur={(e) => this._save((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => this._onKeyDown(e)}
            />
          )
        case 'Float':
          return (
            <input
              autoFocus
              type='number'
              step='any'
              ref='input'
              defaultValue={valueString}
              onBlur={(e) => this._save((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => this._onKeyDown(e)}
            />
          )
        case 'Boolean':
          return (
            <ToggleButton
              leftText='false'
              rightText='true'
              side={valueString === 'true' ? ToggleSide.Right : ToggleSide.Left}
              onClickOutside={(side) => this._save(side === ToggleSide.Left ? 'false' : 'true')}
            />
          )
        case 'Enum':
          return (
            <select
              autoFocus
              defaultValue={valueString}
              onBlur={(e) => this._save((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => this._onKeyDown(e)}
            >
              {this.props.field.enumValues.map((enumValue) => (
                <option key={enumValue}>{enumValue}</option>
              ))}
            </select>
          )
        case 'String':
          return (
            <textarea
              autoFocus
              type='text'
              ref='input'
              defaultValue={valueString}
              onKeyDown={(e) => this._onEscapeTextarea(e)}
              onBlur={(e) => this._save((e.target as HTMLInputElement).value)}
            />
          )
      }
    }

    return (
      <span className={classes.value}>{valueString}</span>
    )
  }

  render () {
    const rootClassnames = classnames({
      [classes.root]: true,
      [classes.null]: this.props.value === null,
      [classes.editing]: this.state.editing,
    })

    return (
      <div
        style={{ width: this.props.width }}
        className={rootClassnames}
        onDoubleClick={() => this._startEditing()}
      >
        {this._renderContent()}
      </div>
    )
  }
}
