import '@testing-library/jest-dom/vitest'
import {cleanup} from '@testing-library/react'
import {afterEach} from 'vitest'
import {queryClient} from "../api/queryClient.ts";

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  queryClient.clear()
})
