export const TAKE_DAMAGE = 'TAKE_DAMAGE'
export const TAKE_HEAL = 'TAKE_HEAL'

export function takeDamage() {
    return {
        type: TAKE_DAMAGE,
        payload: {
            healthDown: -2
        }
    }
}
export function takeHeal() {
    return {
        type: TAKE_HEAL,
        payload: {
            healthUP: 10
        }
    }
}