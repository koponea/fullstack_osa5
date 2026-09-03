const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helpers')
const helper = require('./test_helper')

describe('total likes', () => {
  test('of no list is zero', () => {
    // the input of the test is a null
    const result = listHelper.totalLikes(helper.listWithNoBlogList)
    assert.strictEqual(result, 0)
  })

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(helper.listWithNoBlogs)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(helper.listWithManyBlogsSimple)
    assert.strictEqual(result, 35)
  })

  test('of a list where some have no likes element is calculated right', () => {
    const result = listHelper.totalLikes(helper.listWithAlsoNoLikes)
    assert.strictEqual(result, 11)
  })
})