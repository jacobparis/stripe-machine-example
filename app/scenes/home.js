import * as React from "react"
import axios from 'axios'

import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'

import { Frame } from 'framer'
import { motion, AnimatePresence } from 'framer-motion'

import { useMachine } from '@xstate/react'
import { AppMachine } from '../machines'

const CARD_NUMBER_OPTIONS = {
    showIcon: true,
    style: {
        base: {
            iconColor: "#456",
            color: "#456",
            fontWeight: 400,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: "20px",
            fontSmoothing: "antialiased",
            "::placeholder": {
                color: "#abc"
            },
            ":-webkit-autofill": {
                color: "#fce883"
            }
        },
        invalid: {
            iconColor: "#FFC7EE",
            color: "#FFC7EE"
        }
    },
}

const CARD_EXPIRY_OPTIONS = {
    style: {
        iconStyle: "solid",
        base: {
            iconColor: "#456",
            color: "#456",
            fontWeight: 400,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            "::placeholder": {
                color: "#abc"
            },
            ":-webkit-autofill": {
                color: "#fce883"
            }
        },
        invalid: {
            iconColor: "#FFC7EE",
            color: "#FFC7EE"
        }
    },
}

const CARD_CVC_OPTIONS = {
    style: {
        iconStyle: "solid",
        base: {
            textAlign: 'right',
            iconColor: "#456",
            color: "#456",
            fontWeight: 400,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            "::placeholder": {
                color: "#abc"
            },
            ":-webkit-autofill": {
                color: "#fce883"
            }
        },
        invalid: {
            iconColor: "#FFC7EE",
            color: "#FFC7EE"
        }
    },
}

export default function HomeScene() {
    const stripe = useStripe()
    const elements = useElements()

    React.useEffect(() => {
        if (stripe && elements) send({
            type: 'READY'
        })
    }, [stripe, elements])

    const [state, send] = useMachine(AppMachine.withContext({
        isReady: false,
        paymentMethodId: null,
        customer: null,
        subcription: null,
    }), {
        devTools: true,
        services: {
            createPaymentMethod() {
                return stripe.createPaymentMethod({
                    type: 'card',
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        email: 'jenny.rosen@example.com',
                    },
                })
                .then(result => {
                    if (result.error) throw result.error

                    return result
                })
            },
            createCustomer(context) {
                return axios.post('/.netlify/functions/create-customer', {
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        email: 'jenny.rosen@example.com',
                        payment_method: context.paymentMethodId
                    }
                })
                .then(response => response.data)
            }
        }
    })

    function handleSubmit(event) {
        event.preventDefault()

        if (state.matches('steps.contact')) send({ type: 'NEXT' })
        if (state.matches('steps.card.front')) send({ type: 'BACK' })

        if (state.matches('steps.card.back')) send({ type: 'CHECKOUT' })
    }

    return state.matches('stripe.preload')
        ? <p> Loading... </p>
        : (
            <main>
                <div style={{
                    padding: '4rem 0',
                    display: 'grid',
                    transformStyle: 'preserve-3d'
                }}>
                    <AnimatePresence initial={false}>
                        <motion.div
                            key="contact"
                            initial="initial"
                            animate={
                                state.matches('steps.contact')
                                    ? 'in'
                                    : state.matches('steps.success')
                                        ? 'success'
                                        : 'out'
                            }
                            variants={{
                                initial: {
                                    rotateZ: '5deg',
                                    x: '100%'
                                },
                                in: {
                                    rotateZ: '0deg',
                                    x: 0
                                },
                                out: {
                                    rotateZ: '-5deg',
                                    x: '-100%'
                                },
                                success: {
                                    rotateZ: '0deg',
                                    x: [null, '0%', '0%', '0%', '0%', '100%'],
                                    z: [null, '51px'],
                                    transition: {
                                        ease: 'easeOut'
                                    }
                                }
                            }}
                            style={{ gridColumn: 1, gridRow: 1 }}
                        >
                            <form
                                id="form"
                                style={{
                                    transformStyle: 'preserve-3d'
                                }}
                                onSubmit={handleSubmit}
                            >
                                <motion.div
                                    style={{
                                        borderRadius: '0.5rem',
                                        margin: '1rem auto',
                                        padding: '8rem 3rem 2rem',
                                        width: '20rem',
                                        maxWidth: '90%',
                                        position: 'relative'
                                    }}
                                >
                                    <Frame
                                        background="#f5f5f5"
                                        left="0"
                                        right="0"
                                        top="0"
                                        bottom="0"
                                        style={{
                                            clipPath: 'polygon(0px 60%, 100% 0px, 100% 100%, 0px 100%)'
                                        }}
                                    />

                                    <Frame
                                        background="#fafafa"
                                        left="0"
                                        right="0"
                                        top="0"
                                        bottom="0"
                                        style={{
                                            clipPath: 'polygon(0px 0px, 100% 60%, 100% 100%, 0px 100%)'
                                        }}
                                    />

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexBasis: '60%',
                                        transform: 'translateZ(51px)'
                                    }}>
                                        <label style={{
                                            color: '#697889',
                                            textTransform: 'uppercase',
                                            fontSize: '80%'
                                        }}> Email address </label>

                                        <div style={{
                                            background: '#fff',
                                            borderRadius: '0.25rem',
                                            padding: '0.5rem 0.5rem 2px 0.5rem',
                                            border: '1px solid #eee',
                                            boxShadow: '0 0 20px #eee'
                                        }}>
                                            <input
                                                type="text"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#456',
                                                    fontWeight: '400',
                                                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                                                    fontSize: '1.2rem',
                                                    fontSmoothing: 'antialiased',
                                                    lineHeight: '1.2',
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </form>
                        </motion.div>

                    {(state.matches('steps.card') || state.matches('steps.success')) && (
                        <>
                            <motion.div
                                key="card"
                                initial="initial"
                                animate={
                                    state.matches('steps.card')
                                        ? state.matches('steps.card.front')
                                            ? 'front'
                                            : 'back'
                                        : 'success'
                                }
                                variants={{
                                    initial: {
                                        x: '50rem',
                                        y: '0rem',
                                        z: '50px'
                                    },
                                    front: {
                                        rotateZ: [null, '-8deg', '0deg'],
                                        x: [null, '-6rem', '0rem'],
                                        y: [null, '-7rem', '0rem'],
                                        z: [null, '50px'],
                                        transition: {
                                            ease: 'easeOut',
                                            z: { ease: 'easeInOut' }
                                        }
                                    },
                                    back: {
                                        rotateZ: [null, '-8deg', '0deg'],
                                        x: [null, '-6rem', '1rem'],
                                        y: [null, '-7rem', '1rem'],
                                        z: [null, '0px'],
                                        transition: {
                                            ease: 'easeOut',
                                            z: { ease: 'easeInOut' }
                                        }
                                    },
                                    success: {
                                        x: [null, '0rem', '0rem', '0rem', '50rem',],
                                        y: [null, '-13rem', '-13rem', '0rem'],
                                        z: [null, '0px'],
                                        transition: {
                                            ease: 'easeOut'
                                        }
                                    }
                                }}
                                style={{ gridColumn: 1, gridRow: 1 }}
                            >
                                <form
                                    id="form"
                                    style={{
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onSubmit={handleSubmit}
                                >
                                    <motion.div
                                        style={{
                                            background: 'white',
                                            borderRadius: '0.5rem',
                                            margin: '1rem auto',
                                            padding: '3rem 1rem 1rem 1rem',
                                            width: '20rem',
                                            maxWidth: '90%',
                                            boxShadow: 'inset 0 0 47px #dde0f0'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            color: '#fff'
                                        }}>
                                            <label style={{
                                                color: state.matches('stripe.creatingPaymentMethod.failure.incompleteNumber') ? '#e91e63' : '#697889',
                                                textTransform: 'uppercase',
                                                fontSize: '80%'
                                            }}> Card number </label>

                                            <div style={{
                                                background: '#f5f5f5',
                                                borderRadius: '0.25rem',
                                                padding: '0.5rem',
                                                border: '1px solid white',
                                                boxShadow: '0 0 20px white'
                                            }}>
                                                <CardNumberElement
                                                    options={CARD_NUMBER_OPTIONS}
                                                />
                                            </div>
                                        </div>

                                        <br />

                                        <div style={{
                                            display: 'flex',
                                            color: '#fff',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flexBasis: '60%'
                                            }}>
                                                <label style={{
                                                    color: '#697889',
                                                    textTransform: 'uppercase',
                                                    fontSize: '80%'
                                                }}> Cardholder name </label>

                                                <div style={{
                                                    background: '#f5f5f5',
                                                    borderRadius: '0.25rem',
                                                    padding: '0.5rem 0.5rem 2px 0.5rem',
                                                    border: '1px solid white',
                                                    boxShadow: '0 0 20px white'
                                                }}>
                                                    <input
                                                        type="text"
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#456',
                                                            fontWeight: '400',
                                                            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                                                            fontSize: '1.2rem',
                                                            fontSmoothing: 'antialiased',
                                                            lineHeight: '1.2',
                                                            width: '100%'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <label style={{
                                                    color: state.matches('stripe.creatingPaymentMethod.failure.incompleteExpiry') ? '#e91e63' : '#697889',
                                                    textTransform: 'uppercase',
                                                    fontSize: '80%'
                                                }}> Expiry Date </label>

                                                <div style={{
                                                    background: '#f5f5f5',
                                                    borderRadius: '0.25rem',
                                                    padding: '0.5rem',
                                                    border: '1px solid white',
                                                    boxShadow: '0 0 20px white'
                                                }}>
                                                    <CardExpiryElement
                                                        options={CARD_EXPIRY_OPTIONS}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </form>
                            </motion.div>

                            <motion.div
                                key="confirm"
                                initial="initial"
                                animate={
                                    state.matches('steps.card')
                                        ? state.matches('steps.card.front')
                                            ? 'back'
                                            : 'front'
                                        : 'success'
                                }
                                variants={{
                                    initial: {
                                        x: '50rem',
                                        y: '0rem',
                                        z: '0px'
                                    },
                                    back: {
                                        rotateZ: [null, '-8deg', '0deg'],
                                        x: [null, '6rem', '1rem'],
                                        y: [null, '6rem', '1rem'],
                                        z: [null, '0px'],
                                        transition: {
                                            ease: 'easeOut',
                                            z: { ease: 'easeInOut' }
                                        }
                                    },
                                    front: {
                                        rotateZ: [null, '-8deg', '0deg'],
                                        x: [null, '6rem', '0rem'],
                                        y: [null, '6rem', '0rem'],
                                        z: [null, '50px'],
                                        transition: {
                                            ease: 'easeOut',
                                            z: { ease: 'easeInOut' }
                                        }
                                    },
                                    success: {
                                        x: [null, '0rem', '0rem', '0rem', '50rem',],
                                        y: [null, '-15rem', '-15rem', '0rem'],
                                        z: [null, '0px'],
                                        transition: {
                                            ease: 'easeOut'
                                        }
                                    }
                                }}
                                style={{
                                    gridColumn: 1,
                                    gridRow: 1,
                                    transformOrigin: 'center left',
                                    backfaceVisibility: 'hidden'
                                }}
                            >
                                <form
                                    id="form"
                                    style={{
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onSubmit={handleSubmit}
                                >
                                    <motion.div
                                        animate={state.matches('steps.selected.back') ? { y: 20 } : { y: 0 }}
                                        transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
                                        style={{
                                            background: '#b6bdf8',
                                            borderRadius: '0.5rem',
                                            margin: '1rem auto',
                                            padding: '6rem 1rem 1rem',
                                            width: '20rem',
                                            maxWidth: '90%',
                                            position: 'relative',
                                            boxShadow: 'inset 0 0 47px #9999ff'
                                        }}
                                    >
                                        <Frame background="#456" left="0" right="0" top="1rem" height="3rem" />
                                        <br />
                                        <div style={{
                                            display: 'flex',
                                            color: '#fff',
                                            justifyContent: 'space-between',
                                            flexDirection: 'row-reverse'
                                        }}>

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                textAlign: 'right'
                                            }}>
                                                <label style={{
                                                    color: state.matches('stripe.creatingPaymentMethod.failure.incompleteCvc') ? '#e91e63' : 'white',
                                                    textTransform: 'uppercase'
                                                }}>  CV Code </label>
                                                <div style={{
                                                    background: '#f5f5f5',
                                                    borderRadius: '0.25rem',
                                                    padding: '0.5rem',
                                                    border: '1px solid white',
                                                    boxShadow: '0 0 20px #ccf'
                                                }}>
                                                    <CardCvcElement
                                                        options={CARD_CVC_OPTIONS}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </>
                    )}

                    {state.matches('steps.success') && (
                        <motion.div
                            style={{
                                gridColumn: 1,
                                gridRow: 1,
                                textAlign: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}
                        >
                            <p> You have successfully subscribed! </p>
                        </motion.div>
                    )}
                    </AnimatePresence>

                </div>

                {!state.matches('steps.success') && (
                    <div style={{
                        textAlign: 'center'
                    }}>
                        <button
                            type="submit"
                            form="form"
                            disabled={!stripe}
                            style={{
                                border: 'none',
                                padding: '1rem 4rem',
                                borderRadius: '2rem',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.12)',
                                background: '#29Be39',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                color: 'white',
                            }}
                        >
                            Next Step
                        </button>
                    </div>
                )}
            </main>
        )
}
