Images = new Mongo.Collection('images');

var ImageMixin = {
  addImage() {
    var size = (100 + Math.random() * 100).toFixed(0);
    Images.insert({
      url: 'http://lorempixel.com/' + size + '/' + size
    });
  },
  removeImage(id) { Images.remove(id); },
};

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

if (Meteor.isClient) {
  Template.blaze.helpers({
    text() {
      return Session.get('text') || 'This is a blaze template';
    },
    images() { return Images.find().fetch(); },
    component() { return ImageList; }
  });
}

var App = React.createClass({
  mixins: [ReactMeteorData, ImageMixin],
  getMeteorData() {
    return {
      images: Images.find().fetch()
    }
  },
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

// Renders the component on startup
if (Meteor.isClient) {
  Meteor.startup(
    () => React.render(<App />, document.getElementById('root'))
  );
}
