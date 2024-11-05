import { notFound } from 'next/navigation'
import { getModifierById } from '../_lib/actions'
import { ModifierDetails } from '../_components/modifier-details'
import { Shell } from '@/components/shell'

interface ModifierPageProps {
  params: {
    id: string
  }
}

export default async function ModifierPage({ params }: ModifierPageProps) {
  const { data: modifier, error } = await getModifierById(Number(params.id))

  if (error || !modifier) {
    notFound()
  }

  return (
    <Shell>
      <ModifierDetails modifier={modifier} />
    </Shell>
  )
}
