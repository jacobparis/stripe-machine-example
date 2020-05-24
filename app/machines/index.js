import { Machine, assign, send } from 'xstate'

export const UiMachine = Machine({
  id: 'ui',
  initial: 'contact',
  states: {
    contact: {
      on: {
        NEXT: 'card'
      }
    },
    card: {
      on: {
        NEXT: 'confirm'
      }
    },
    confirm: {
      on: {}
    }
  }
})

export const AppMachine = Machine({
  id: 'app',
  type: 'parallel',
  states: {
    steps: {
      initial: 'contact',
      states: {
        contact: {
          on: {
            NEXT: 'card'
          }
        },
        card: {
          initial: 'front',
          states: {
            front: {},
            back: {}
          },
          on: {
            FRONT: '.front',
            BACK: '.back'
          }
        },
        success: {
          type: 'final'
        }
      }
    },
    stripe: {
      initial: 'preload',
      states: {
        preload: {
          invoke: {
            src: 'pause',
            onDone: 'idle'
          },
          on: {
            READY: {
              actions: assign({
                isReady: true
              })
            }
          }
        },
        idle: {
          on: {
            '': {
              cond: (context) => context.isReady,
              target: 'ready'
            },
            READY: {
              internal: true
            }
          }
        },
        ready: {
          on: {
            CHECKOUT: 'creatingPaymentMethod'
          }
        },
        creatingPaymentMethod: {
          initial: 'loading',
          states: {
            loading: {
              invoke: {
                src: 'createPaymentMethod',
                onDone: {
                  target: 'success',
                  actions: assign({
                    paymentMethodId: (_, event) => event.data.paymentMethod.id
                  })
                },
                onError: [
                  {
                    cond: (_, event) => event.data.code === 'incomplete_number',
                    target: 'failure.incompleteNumber'
                  },
                  {
                    cond: (_, event) => event.data.code === 'incomplete_expiry',
                    target: 'failure.incompleteExpiry'
                  },
                  {
                    cond: (_, event) => event.data.code === 'incomplete_cvc',
                    target: 'failure.incompleteCvc'
                  },
                  {
                    cond: (_, event) => {
                      console.log("General createPaymentMethod error", { event })

                      return true
                    },
                    target: 'failure.general'
                  }
                ]
              }
            },
            success: {
              type: 'final'
            },
            failure: {
              on: {
                CHECKOUT: {
                  target: 'loading'
                }
              },
              states: {
                general: {},
                incompleteNumber: {
                  entry: send('FRONT')
                },
                incompleteExpiry: {
                  entry: send('FRONT')
                },
                incompleteCvc: {}
              }
            }
          },
          onDone: 'creatingCustomer'
        },
        creatingCustomer: {
          initial: 'loading',
          states: {
            loading: {
              invoke: {
                src: 'createCustomer',
                onDone: {
                  actions: assign({
                    customer: (_, event) => event.data.customer,
                    subscription: (_, event) => event.data.subscription,
                  }),
                  target: 'success'
                },
                onError: [
                  {
                    cond: (_, event) => event.data.response.data.param === 'resource_missing',
                    target: 'failure.resourceMissing'
                  },
                  {
                    cond: (_, event) => event.data.response.data.param === 'payment_method',
                    target: 'failure.paymentMethod'
                  },
                  {
                    cond: (_, event) => {
                      console.log("General createCustomer error", { event })

                      return true
                    },
                    target: 'failure'
                  }
                ]
              }
            },
            success: {
              type: 'final'
            },
            failure: {
              on: {
                CHECKOUT: 'loading'
              },
              states: {
                general: {},
                resourceMissing: {},
                paymentMethod: {}
              }
            }
          },
          onDone: 'success'
        },
        success: {
          type: 'final'
        }
      },
      onDone: 'steps.success'
    }
  }
}, {
  actions: {
    cache: assign((_, event) => event.data)
  },
  services: {
    pause: () => new Promise((resolve) => setTimeout(resolve, 2000))
  }
})
