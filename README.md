This is my project for the Baseline Tooling hackathon.
https://baseline.devpost.com/

## Inspiration
I've never heard of the Baseline project even though I try to follow new browser APIs and features. I've seen the MDN browser table many times, so when I read about this Hackathon I thought - great, I'll find a tool that has yet to integrate it, add it and be done. My first thought was to add to Pycharm plugin and it took some research to see it was already integrated directly into the IDE. That made me build the awesome-baseline repo so that I could see what exists. I was sure this will be the way to go and prepared to look for less well known tools. Then, (literally) in the shower, I had an inspiration - maybe I can make a game out of this?
At first I didn't take this seriously since this is a bit out of the left field for this hackathon. I talked to a friend and we agreed it is not a good idea. As a lark I asked my vibe server Claude to create a game with the simplest prompt:
```download this npm repo: https://www.npmjs.com/package/web-features, understnad the various features it has and create a web game that tests user on which feature has which status (baseline 2024, full-available, etc)```
I had little faith in the result, but surprisingly it one shot a game, and shockingly, that game turned out fun. Score!

## What it does
This is a quiz game that uses Baseline data to measure user's knowledge of web features. It has two modes:
1. Shows you a feature and asks what is its maturity (multiple choice).
2. Shows you two features and you need to choose the latest one.

## How we built it
Lately I've been exploring using Claude Agent to write initial code and then integrating it and polishing it with hand written code, Cursor and Claude Agent.

## Challenges we ran into
Main challenge was to overcome my initial doubt of this idea and actually explore it.

## Accomplishments that we're proud of
I'm proud of finding a fun creative twist on the requirements of this hackathon.
I'm very happy of how the game is not only fun but also taught me about new features and surprised me with which features come first. 

## What we learned
Most importantly, through playing the game I learned a lot of surprising facts about early web features and which came first, and about new web features that I have not heard about.
Technically - I've learned and am learning a lot about working with AI agents and how to prompt them better and also their weak points.

## What's next for Web Features Game
1. I am thinking of new question types, especially ones that facilitate learning new features.
2. Add natural game features such as scores, leaderboards and challenging friends.]\
