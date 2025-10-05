import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro">
            📚 Ver Documentación Completa
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProjectStats() {
  return (
    <section className={styles.stats}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className="text--center">
              <Heading as="h2">6,477</Heading>
              <p>Usuarios Legacy Migrados</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center">
              <Heading as="h2">500+</Heading>
              <p>Indicadores TradingView</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center">
              <Heading as="h2">12,000+</Heading>
              <p>Líneas de Documentación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          🚀 Acceso Rápido
        </Heading>
        <div className="row">
          <div className="col col--6 col--4--tablet">
            <div className="card">
              <div className="card__header">
                <Heading as="h3">🎯 Sistema TradingView</Heading>
              </div>
              <div className="card__body">
                <p>Gestión completa de accesos a indicadores con API automática</p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/systems/tradingview-access/overview">
                  Ver Sistema
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--6 col--4--tablet">
            <div className="card">
              <div className="card__header">
                <Heading as="h3">🍪 Sistema de Cookies</Heading>
              </div>
              <div className="card__body">
                <p>Consentimiento GDPR y tracking de usuarios con segmentación</p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/systems/cookies/overview">
                  Ver Sistema
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="row margin-top--lg">
          <div className="col col--6 col--4--tablet">
            <div className="card">
              <div className="card__header">
                <Heading as="h3">🛒 Dashboard de Compras</Heading>
              </div>
              <div className="card__body">
                <p>Analytics completo de revenue, suscripciones y reembolsos</p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/systems/purchases/overview">
                  Ver Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--6 col--4--tablet">
            <div className="card">
              <div className="card__header">
                <Heading as="h3">📊 Arquitectura Completa</Heading>
              </div>
              <div className="card__body">
                <p>Stack tecnológico, migración legacy y contexto del proyecto</p>
              </div>
              <div className="card__footer">
                <Link
                  className="button button--primary button--block"
                  to="/docs/project/overview">
                  Ver Arquitectura
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Documentación técnica completa de APIDevs Trading Platform - Sistema de indicadores de trading con gestión de accesos TradingView">
      <HomepageHeader />
      <main>
        <ProjectStats />
        <QuickLinks />
      </main>
    </Layout>
  );
}
