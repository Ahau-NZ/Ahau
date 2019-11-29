const viewsStorage = 'views_list'

export const getView = () => JSON.parse(window.localStorage.getItem(viewsStorage)) || []

export const concatView = (value) => window.localStorage.setItem(viewsStorage, JSON.stringify(getView().concat(value)))
