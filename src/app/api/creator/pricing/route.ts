import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pricingTiers } = await req.json();

    // Get or create Stripe account for the creator
    let creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { stripeAccount: true },
    });

    if (!creator?.stripeAccount) {
      // Create a Stripe account for the creator
      const stripeAccount = await stripe.accounts.create({
        type: "express",
        email: session.user.email!,
        business_profile: {
          name: session.user.name || "Trading Course Creator",
        },
      });

      creator = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          stripeAccount: {
            create: {
              stripeAccountId: stripeAccount.id,
              isEnabled: false,
            },
          },
        },
        include: { stripeAccount: true },
      });
    }

    // Create or update Stripe products and prices
    const products = await Promise.all(
      pricingTiers.map(async (tier: any) => {
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          metadata: {
            creatorId: session.user.id,
          },
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.price * 100, // Convert to cents
          currency: "usd",
          metadata: {
            creatorId: session.user.id,
            tierName: tier.name,
          },
        });

        return {
          productId: product.id,
          priceId: price.id,
          name: tier.name,
          price: tier.price,
          features: tier.features,
          description: tier.description,
        };
      })
    );

    // Save pricing information to the database
    await prisma.coursePricing.upsert({
      where: { creatorId: session.user.id },
      update: {
        tiers: products,
      },
      create: {
        creatorId: session.user.id,
        tiers: products,
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error saving pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricing = await prisma.coursePricing.findUnique({
      where: { creatorId: session.user.id },
    });

    return NextResponse.json(pricing?.tiers || []);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
} 