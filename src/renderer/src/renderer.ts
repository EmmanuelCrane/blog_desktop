import { marked } from 'marked'
import axios from 'axios'
let active = true

interface Tags {
  tag: string
  id: string
  css_class: Array<string>
  text_tag?: string
  properties?: Array<{ name: string; value: string }>
}

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const id_markdown = document.getElementById('content-markdown-preview')
    const id_html = document.getElementById('content-html-preview')
    const btn_switch = document.getElementById('btn-switch')
    const btn_save = document.getElementById('btn-save')
    doAThing()

    btn_Event(btn_switch)

    parcing_markdown(id_markdown, id_html)

    handle_button_save(btn_save, id_markdown)
  })
}

function doAThing(): void {
  const versions = window.electron.process.versions
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)
  replaceText('.v8-version', `V8 v${versions.v8}`)
}

function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

function parcing_markdown(id_markdoun, id_html): void {
  id_markdoun.addEventListener('keyup', (event) => {
    const markdown_value = event.target.value
    if (active) {
      id_html.innerHTML = marked(markdown_value)
    } else {
      id_html.textContent = marked(markdown_value)
    }
  })
}

function btn_Event(btn_switch): void {
  btn_switch.addEventListener('click', () => {
    active = !active
  })
}

function handle_button_save(btn_save, id_markdown): void {
  btn_save.addEventListener('click', (event) => {
    event.preventDefault()
    create_form(id_markdown)
  })
}

function create_form(id_markdown): void {
  const form = document.getElementById('content_form')

  if (!form) {
    const name_inputs: Array<string> = ['category', 'title', 'name', 'avatar']
    const content_form = create_tag({ tag: 'div', id: 'content_form', css_class: ['content_form'] })
    const form = create_tag({ tag: 'form', id: 'form', css_class: ['form'] })
    const form_contents = name_inputs.map((element) => {
      const form_content = create_tag({
        tag: 'div',
        id: 'form_content',
        css_class: ['form_content']
      })
      const form_control = create_tag({
        tag: 'input',
        id: element,
        css_class: ['form_control'],
        properties: [
          { name: 'type', value: 'text' },
          { name: 'placeholder', value: element },
          { name: 'name', value: element }
        ]
      })
      form_content.appendChild(form_control)
      return form_content
    })
    const btn_form = create_tag({
      tag: 'button',
      id: 'btn_form',
      css_class: ['btn_form'],
      text_tag: 'Enviar',
      properties: [{ name: 'type', value: 'submit' }]
    })
    form_contents.push(btn_form)
    content_form.appendChild(form)

    form_contents.map((element) => {
      form.appendChild(element)
    })

    const parent = id_markdown.parentNode
    parent?.insertBefore(content_form, id_markdown)

    form.addEventListener('submit', form_submit)
  }
}

function create_tag({ tag, id, css_class, text_tag, properties }: Tags): HTMLElement {
  const d = document
  const tag_element = d.createElement(tag)
  tag_element.id = id
  css_class.map((itemm_css) => tag_element.classList.add(itemm_css))
  if (text_tag !== undefined) tag_element.textContent = text_tag
  properties?.map((element) => {
    tag_element.setAttribute(element.name, element.value)
  })

  return tag_element
}

async function form_submit(event): void {
  event.preventDefault()
  const form: HTMLFormElement = document.querySelector('#form')
  const markdown_text = document.querySelector('#content-markdown-preview')
  let form_data: FormData
  if (form && markdown_text) {
    form_data = new FormData(form)
    form_data.append('data', markdown_text.value)
    const response = await save_post(form_data)
    console.log(response)
  }
}

async function save_post(data: FormData): Promise<any> {
  if (!data) {
    throw Error('Error datos null')
  }
  const headers = new Headers()
  headers.append('Content-type', 'application/json')

  const URI = 'http://localhost:3000/createpost'

  const data_post = await axios({
    method: 'post',
    url: URI,
    headers: {
      'Content-type': 'application/json'
    },
    data
  })

  const response = await data_post.data
  console.log(response)
  return response
}

init()
