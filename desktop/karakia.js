const boxen = require('boxen')

const text = `Kia tau ngā manaakitanga a te mea ngaro
ki runga ki tēnā, ki tēnā o tātou
Kia mahea te hua mākihikihi
kia toi te kupu, toi te mana, toi te aroha, toi te Reo Māori
kia tūturu, ka whakamaua kia tīna! Tīna!
Hui e, Tāiki e!

Let the strength and life force of our ancestors
Be with each and every one of us
Freeing our path from obstruction
So that our words, spiritual power, love, and language are upheld;
Permanently fixed, established and understood!
Forward together!`

module.exports = function karakia () {
  console.log(boxen(text, {
    padding: 1,
    margin: { top: 0, left: 1, right: 1, bottom: 1 },
    borderColor: 'black',
    borderStyle: 'round'
  }))
}

// the tikanga of starting a meeting is to acknowledge
// where we're coming from, and what we value.
// this is an important part of this program
