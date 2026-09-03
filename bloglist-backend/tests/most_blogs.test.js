const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helpers')
const helper = require('./test_helper')

describe('most blogs', () => {
  const listWithManyBlogs = [
    { _id: '5a403aa71b54a676234d17f8', title: 'Mindblowing 3', author: 'Zooty3', url: 'http://www.helsinki.fi/Harmful3.html', likes: 3, __v: 0 },
    { _id: '5a400aa71b54a676234d17f8', title: 'Mindblowing 0', author: 'Zooty0', url: 'http://www.helsinki.fi/Harmful7.html', likes: 0, __v: 0 },
    { _id: '5a406aa71b54a676234d17f8', title: 'Mindblowing 6', author: 'Zooty6', url: 'http://www.helsinki.fi/Harmful6.html', likes: 6, __v: 0 },
    { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: 'Zooty5', url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
    { _id: '5a427aa71b54a676234d17f8', title: 'Mindblowing 17', author: 'Zooty17', url: 'http://www.helsinki.fi/Harmful17.html', likes: 17, __v: 0 },
    { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: 'Zooty5', url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
    { _id: '5a417aa71b54a676234d17f8', title: 'Mindblowing 17 too', author: 'Zooty17_2', url: 'http://www.helsinki.fi/Harmful17.html', likes: 17, __v: 0 }, //
    { _id: '5a426aa71b54a676234d17f8', title: 'Mindblowing 6 too', author: 'Zooty6_2', url: 'http://www.helsinki.fi/Harmful6.html', likes: 6, __v: 0 }
  ]
  const listWithAlsoNoAuthors = [
    { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: helper.anonymous, url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
    { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: 'Zooty5', url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
    { _id: '5a409aa71b54a676234d17f8', title: 'Mindblowing no', url: 'http://www.helsinki.fi/HarmfulNO.html', likes: 5, __v: 0 },
    { _id: '5a400aa71b54a676234d17f8', title: 'Mindblowing no 2', url: 'http://www.helsinki.fi/HarmfulNO.html', likes: 6, __v: 0 },
    { _id: '5a406aa61b54a676234d17f8', title: 'Mindblowing 6', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful6.html', __v: 0 } //
  ]

  test('of no list is zero gives no blogger gracefully', () => {
    // the input of the test is a null
    const result = listHelper.mostBlogs(helper.listWithNoBlogList)
    assert.strictEqual(result, null)
  })

  test('of empty list gives no blogger gracefully', () => {
    const result = listHelper.mostBlogs(helper.listWithNoBlogs)
    assert.strictEqual(result, null)
  })

  // eslint-disable-next-line @stylistic/js/quotes
  test("when list has only one blog the blogger is given", () => {
    const result = listHelper.mostBlogs(helper.listWithOneBlog)
    assert.deepStrictEqual(result, { author: helper.listWithOneBlog[0].author, blogs: 1 })
  })

  test('of a bigger list and the last most active blogger is given', () => {
    const result = listHelper.mostBlogs(listWithManyBlogs)
    assert.deepStrictEqual(result, { author: 'Zooty5', blogs: 2 })
  })

  test('of a list where some have no authors the most blogged anonymous is found right', () => {
    // get '' when no author recorded
    const result = listHelper.mostBlogs(listWithAlsoNoAuthors)
    assert.deepStrictEqual(result, { author: helper.anonymous, blogs: 3 })
  })
})