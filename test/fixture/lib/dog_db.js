var dogList = [{
  id: 1,
  breed: 'boxer',
  gender: 'male',
  bark: 'loud',
  age: 2
}, {
  id: 2,
  breed: 'boston terrier',
  gender: 'female',
  bark: 'quiet',
  age: 4
}, {
  id: 3,
  breed: 'chihuahua',
  gender: 'male',
  bark: 'loud',
  age: 2
}, {
  id: 4,
  breed: 'poodle',
  gender: 'female',
  bark: 'quiet',
  age: 5
}];


module.exports = {
  dogList: dogList,
  search: function(age, gender, bark) {
    return _.filter(dogList, function(d) {
      return (d.age == age || !age) &&
        (d.gender == gender || !gender) &&
        (d.bark == bark || !bark);
    });
  },
  get: function(id) {
    return _.find(dogList, function(dog) {
      return dog.id === id;
    });
  }
};