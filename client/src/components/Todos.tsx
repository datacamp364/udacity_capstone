import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.CAPSTONEId != todoId)
      })
    } catch {
      alert('deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.CAPSTONEId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Bucket List App</Header>
        <img src="data:image/jpeg;base64,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" />


        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New bucket list entry',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Type in the name of the new CAPSTONE - bucket - list item"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.CAPSTONEId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.CAPSTONEId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.CAPSTONEId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
