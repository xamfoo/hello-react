# Hello React

[![Join the chat at https://gitter.im/xamfoo/hello-react](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/xamfoo/hello-react?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Try React with Meteor in a quick tutorial.

## Setup

- `meteor create hello-react`
- `cd hello-react`
- `meteor add react` which adds the following packages:
  - `react-runtime` - the React library itself
  - `jsx` - a compiler to compile files with the .jsx extension to JavaScript
  - `react-meteor-data` - a mixin to integrate Meteor reactive data sources
    with React components

hello-react.html
```html
<head>
  <title>hello-react</title>
</head>

<body>
  <div id='root'></div>
</body>
```

## Writing a React component

- Rename `hello-react.js` to `hello-react.jsx`

hello-react.jsx
```javascript
var App = React.createClass({
  render() {
    return (
      <div>
        <h1>Hello React!</h1>
      </div>
    );
  }
});

// Renders the component on startup
if (Meteor.isClient) {
  Meteor.startup(
    () => React.render(<App />, document.getElementById('root'))
  );
}
```

## Rendering reactive data

- Use `ReactMeteorData` mixin in a React component get Meteor reactivity
- Access reactive data sources in `getMeteorData()`
- Data is fetched in `App` and passed down to `ImageList`

hello-react.jsx (differences)
```javascript
Images = new Mongo.Collection('images');

var ImageList = React.createClass({
  render() {
    return (
      <div>
        {this.props.images.map(
          image => <img key={image._id} src={image.url} />
        )}
      </div>
    );
  }
});

var App = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    return {
      images: Images.find().fetch()
    }
  },
  render() {
    return (
      <div>
        <h1>Hello React!</h1>
        <ImageList images={this.data.images} />
      </div>
    );
  }
});
```

- Now use `meteor shell` or the browser console to add images to the database
- Example: `Images.insert({url: 'http://lorempixel.com/200/200'})`
- Voila! Images should appear in your browser

### Write a mixin

- Mixins allow you to reuse methods and component definitions across different
  components

hello-react.jsx (differences)
```javascript
var ImageMixin = {
  addImage() {
    var size = (100 + Math.random() * 100).toFixed(0);
    Images.insert({
      url: 'http://lorempixel.com/' + size + '/' + size
    });
  },
  removeImage(id) { Images.remove(id); },
};
```

## Binding events

- We can now handle events using methods in the mixin to add and remove images

hello-react.jsx (differences)
```javascript
var ImageList = React.createClass({
  mixins: [ImageMixin],
  render() {
    return (
      <div>
        {this.props.images.map(
          image => <img key={image._id} src={image.url}
            onClick={this.removeImage.bind(this, image._id)} />
        )}
      </div>
    );
  }
});

var App = React.createClass({
  //...
  mixins: [ReactMeteorData, ImageMixin],
  render() {
    return (
      <div>
        <h1>Hello React!</h1>
        <button onClick={this.addImage}>Add Image</button>
        <ImageList images={this.data.images} />
      </div>
    );
  }
});
```

## Rendering a Blaze template in a React component

- Render a Blaze template in `componentDidMount()`. This is invoked once only
  on the client immediately after initial rendering.

hello-react.html (differences)
```html
<template name='blaze'>
  <p>{{text}}</p>
</template>
```

hello-react.jsx (differences)
```javascript
if (Meteor.isClient) {
  Template.blaze.helpers({
    text () {
      return Session.get('text') || 'This is a blaze template';
    },
  });
}

var App = React.createClass({
  //...
  componentDidMount() {
    Blaze.render(
      Template.blaze,
      React.findDOMNode(this).querySelector('.blazeTemplate')
    );
  },
  render() {
    return (
      <div>
        <h1>Hello React!</h1>
        <button onClick={this.addImage}>Add Image</button>
        <ImageList images={this.data.images} />
        <div className='blazeTemplate'></div>
      </div>
    );
  }
});
```

- Now in the browser console try `Session.set('text', 'Hello Blaze!')` to see
  changes in the Blaze template

## Rendering a React component in a Blaze template

- Run `meteor add react-template-helper` to include a React component inside
  your Meteor template

hello-react.html (differences)
```html
<template name='blaze'>
  <p>{{text}}</p>
  <div>{{> React component=component images=images}}</div>
</template>
```

hello-react.jsx (differences)
```javascript
if (Meteor.isClient) {
  Template.blaze.helpers({
    // text ()...
    images () { return Images.find().fetch(); },
    component () { return ImageList; }
  });
}
```

## Gotchas

### render() is not reactive

> If you access a Meteor reactive data source from your component's render
> method, the component will not automatically rerender when data changes. If
> you want your component to rerender with the most up-to-date data, access all
> reactive functions from inside the getMeteorData method.

### React components must be the only thing in the wrapper element

> Due to a limitation of React (see facebook/react #1970, 2484), a React
> component must be rendered as the only child of its parent node, meaning it
> cannot have any siblings.

## References
- Official documentation - [React in Meteor](http://react-in-meteor.readthedocs.org/en/latest/)
- React documentation - [Facebook](https://facebook.github.io/react/docs/getting-started.html)
- React packages - [Github](https://github.com/meteor/react-packages)
- ES6 features - [Github](https://github.com/lukehoban/es6features)
