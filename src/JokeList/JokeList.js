// Components
import React, { Component } from 'react';
import Joke from '../Joke/Joke';

//Styles
import './JokeList.css';

//Utilities
import axios from 'axios';
import uuid from 'uuid/v4';

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || "[]"),
      loading: false
    }

    this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
        this.getJokes();
    }
  }

  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get('https://icanhazdadjoke.com/', {
          headers: { Accept: 'application/json' }
        })
        let data = res.data;
        if (!this.seenJokes.has(data.joke)) {
          jokes.push({
            text: data.joke,
            votes: 0,
            id: uuid()
          })
        }
      }
      this.setState(st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
        }),
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
      } catch(e) {
        alert(e);
        this.setState({loading: false})
      }
  }

  handleVote(id, delta) {
    this.setState(st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta} : j
        )
      }),
    () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));

}

  handleClick() {
    this.setState({loading: true}, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
        )
      }
      let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
      return (
        <div className="JokeList">
          <div className="JokeList-sidebar">
            <h1 className="JokeList-title">
              <span>Dad</span> Jokes
            </h1>
            <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
            <button className="JokeList-getmore"
                    onClick={this.handleClick}
            >
              Get Jokes
            </button>
          </div>

          <div className="JokeList-jokes">
            {jokes.map(joke => (
              <Joke votes={joke.votes}
                    text={joke.text}
                    key={joke.id}
                    upvote={() => this.handleVote(joke.id, 1)}
                    downvote={() => this.handleVote(joke.id, -1)}
              />
            ))}
          </div>
        </div>
      )
  }
}

export default JokeList;
